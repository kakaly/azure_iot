module.exports = function (context, IoTHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array: ${IoTHubMessages}`);
    var deviceId = "";
    var image_url = "";
    var gps = "";

    IoTHubMessages.forEach(message => {
        context.log(`Processed message: ${message}`);
        deviceId = message.deviceId;
        image_url = message.image_url;
        gps = message.gps;
    });

    var output = {
        "deviceId": deviceId,
        "image_url": image_url,
        "gps": gps
    };

    context.log(`Output content: ${output}`);
    context.bindings.outputDocument = output;
    context.done();
};