// Initialize the IoTHub and get an instance of it
const iothub = require('azure-iothub');
const cosmosdB = require("@azure/cosmos").CosmosClient;

// IoTHub connection string - Found under 'Shared access policies' section of IoTHub
const connectionString = '[Primary Connection String]';
const registry = iothub.Registry.fromConnectionString(connectionString);

// CosmosDB variables - Found under 'Keys' section of CosmosDB
const hostUrl = "[Cosmosdb Host URL]";
const authKey = "[Cosmosdb Primary Key]";
// DB and container ID
const databaseId = "outDatabase";
const containerId = "MyCollection";// Cosmos DB
const cosmos_client = new cosmosdB({
  endpoint: hostUrl,
  auth: {
    masterKey: authKey
  }
});

// Initialize the ExpressJS app
const express = require("express");
var cors = require('cors');
const server = express();
server.use(cors());

// CosmosDB query data endpoint
server.get("/getdata", async (req, res) => {
    console.log(`Querying container:\n${containerId}`);
    const querySpec = {query: "SELECT * FROM c"};
    const { result: results } = await cosmos_client.database(databaseId).container(containerId).items.query(querySpec, {enableCrossPartitionQuery:true}).toArray();
    var result = [] 
    for (var queryResult of results) {
        let resultString = JSON.stringify(queryResult);
        console.log(resultString)
        var gps = queryResult.gps;
        var image_url = queryResult.image_url;
        var res_obj = {
            'gps': gps,
            'image_url': image_url
        }
        result.push(res_obj)
    }
    res.send(result);
});

// IoTHub get devices endpoint
server.get("/getdevices", async (req, res) => {
    await registry.list(function(err, devices){
        if (err) {
            console.error(err.constructor.name + ': ' + err.message);
        } else {
            console.log(devices);
            res.send(devices);
        }
    });
});

// Get device Digital Twin endpoint
server.get("/gettwin/:id", async (req, res) => {
    await registry.getTwin(req.params.id, function(err, twin){
        if (err) {
            console.error(err.constructor.name + ': ' + err.message);
        } else {
            res.send(twin);
        }
    });
});

// Update state of a device on the Digital Twin
server.get("/updatestate/:id/:state", async (req, res) => {
    await registry.getTwin(req.params.id, function(err, twin){
        if (err) {
            console.error(err.constructor.name + ': ' + err.message);
        } else {
            var newstate = {
                'tags': {
                    'state': req.params.state
                }
            }
            twin.update(newstate, function(err) {
                if (err) {
                    console.error(err,'could not update twin');
                } else {
                    console.log('twin state reported');
                }
            });
            res.send("twin state updated")
        }
    });
});

server.listen(4000, () => console.log(`Server listening on port 4000!`))

module.exports = server;