import React, {Component} from 'react';
import './App.css';
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      devices: [],
      twins: [],
      deviceState: {},
      data: [],
      loading: 'initial'
    }
  }

  componentDidMount() {
    var api = 'http://localhost:4000/getdevices'
    this.setState({
      loading: true
    })
    var twins = this.state.twins
    fetch(api, {
        method: 'GET',
      }).then(function(response) {
        return response.json()
      }).then(function(data) {
        var devices = JSON.parse(JSON.stringify(data))
        devices.forEach(device => {
          this.getDeviceTwin(device.deviceId, twins)
        })
        var deviceState = {}
        devices.forEach(device => deviceState[device.deviceId] = 'off')
        this.setState({
          devices: devices,
          deviceState: deviceState,
          loading: false
        })
      }.bind(this)).catch(error => {
        console.log(error)
      })
  }

  async getDeviceTwin(deviceId, twins) {
    var api = 'http://localhost:4000/gettwin/' + deviceId
    this.setState({
      loading: true
    })
    fetch(api, {
        method: 'GET',
      }).then((response) => response.json())
      .then(function(data) {
        var deviceTwin = JSON.parse(JSON.stringify(data))
        twins.push(deviceTwin)
        this.setState({
          twins: twins,
          loading: false
        })
      }.bind(this)).catch(error => {
        console.log(error)
      })
  }

  async getDeviceData(deviceId, data) {
    var api = 'http://localhost:4000/getdata/'
    this.setState({
      loading: true
    })
    fetch(api, {
        method: 'GET',
      }).then((response) => response.json())
      .then(function(data) {
        var deviceData = JSON.parse(JSON.stringify(data))
        data.push(deviceData)
        this.setState({
          data: data,
          loading: false
        })
      }.bind(this)).catch(error => {
        console.log(error)
      })
  }

  async enableDevice(deviceId) {
    var enable = this.state.deviceState[deviceId]
    enable = (enable === 'off')?'on':'off'
    var deviceState = this.state.deviceState
    deviceState[deviceId] = enable
    this.setState({deviceState: deviceState})
    var api = 'http://localhost:4000/updatestate/' + deviceId +  '/' + enable
    console.log(api)
    fetch(api, {
        method: 'GET',
      }).then((response) => {
        console.log(response)
      }).catch(error => {
        console.log(error)
      })
  }

  render() {
    var twins = this.state.twins
    console.log(twins)
    return (
      this.state.loading === false ? (
          <div className="container">
          <div className="row">
          <nav>
          <div className="nav-wrapper orange lighten-2">
            <div className="brand-logo center">Street View Devices Control Center</div>
          </div>
          </nav>
          <table className="highlight">
          <thead>
            <tr className="grey lighten-2">
                <th>Device</th>
                <th>Connection Status</th>
                <th>Status Update Time</th>
                <th>Enable Device</th>
            </tr>
          </thead>
          <tbody>
            {twins.map((twin,i) => {
              return (
                <tr key={i}>
                  <td>{twin.deviceId}</td>
                  <td>{twin.connectionState}</td>
                  <td>{twin.statusUpdateTime}</td>
                  <td className="switch">
                    <label>
                      Off
                      <input type="checkbox" onChange={() => this.enableDevice(twin.deviceId)}/>
                      <span className="lever"></span>
                      On
                    </label>
                  </td>
                </tr>)})}
          </tbody>
          </table>
          </div>
          </div>):<div>Loading...</div> 
    );
  }
}

export default App;