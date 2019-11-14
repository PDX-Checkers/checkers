import React from 'react';
import './App.css';

class App extends React.Component<{}, { username: string, password: string}> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: ''
    }
  }

  ws: any;

  doRegister = () => {
    const xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    const theUrl = '/api/users/';
    xmlhttp.open('POST', theUrl);
    xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlhttp.send(JSON.stringify({ 'username': this.state.username, 'password': this.state.password }));
  }

  doLogin = () => {
    const xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    const theUrl = '/api/users/login';
    xmlhttp.open('POST', theUrl);
    xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlhttp.send(JSON.stringify({ 'username': this.state.username, 'password': this.state.password }));
  }

  doLogout = () => {
    const xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    const theUrl = '/api/users/logout';
    xmlhttp.open('POST', theUrl);
    xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlhttp.send();
  }

  openWs = () => {
    this.ws = new WebSocket('ws://localhost:3000/api/ws');
    this.ws.onmessage = (event: any) => {
      console.log(`Got reply: ${event.data}`);
    };
  }

  sendWs = () => {
    this.ws.send('nerd');
  }

  closeWs = () => {
    this.ws.close();
  }

  clearForm = () => {
    this.setState({
      username: '',
      password: ''
    })
  }

  updateUsername = (event: any) => {
    this.setState({ username: event.target.value })
  }

  updatePassword = (event: any) => {
    this.setState({ password: event.target.value })
  }

  render(): any {
    return <div className="App">
      <div className="container mt-5 w-25">
        <form className="border" id="form">
          <h4 className="text-center mt-3">CONTACT US</h4>
          <div className="row ml-4 mr-4">
            <span>username</span>
          </div>
          <div className="row mb-3 ml-4 mr-4">
            <input 
            type="text" 
            id="username" 
            className="rounded input-large w-100 border"
            value={this.state.username}
            onChange={this.updateUsername} />
          </div>
          <div className="row ml-4 mr-4">
            <span>password</span>
          </div>
          <div className="row mb-3 ml-4 mr-4">
            <input 
            type="text" 
            id="password" 
            className="rounded w-100 border"
            value={this.state.password}
            onChange={this.updatePassword}/>
          </div>
          <div className="mb-3 row ml-4 w-50">
            <button type="button" onClick={this.doRegister} >Register</button>
            <button type="button" onClick={this.doLogin}>Login</button>
            <button type="button" onClick={this.doLogout}>Logout</button>
            <button type="button" onClick={this.clearForm}>Reset</button>
            <button type="button" onClick={this.openWs}>OpenWs</button>
            <button type="button" onClick={this.closeWs}>CloseWs</button>
            <button type="button" onClick={this.sendWs}>Send WS Message</button>
          </div>
        </form>
      </div>
    </div>
  }
}

export default App;
