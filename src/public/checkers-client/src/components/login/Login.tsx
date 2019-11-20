import React from 'react';
import Axios from 'axios'
import './Login.css';
import { WebsocketManager } from '../../websocketManager';

class Login extends React.Component<{
  loggedInCallback: () => void,
  loggedOutCallback: () => void},
{ username: string, password: string, loggedIn: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loggedIn: sessionStorage.getItem('loggedIn') === 'true' ? true : false
    }
  }

  private doRegister = () => {
    Axios.post('/api/users', {
      username: this.state.username,
      password: this.state.password
    });
  }

  private doLogin = () => {
    Axios.post('/api/users/login', {
      username: this.state.username,
      password: this.state.password
    })
    .then(() => {
      sessionStorage.setItem('loggedIn', 'true');
      this.setState({loggedIn: true})
      WebsocketManager.connect();
      this.props.loggedInCallback();
    });
  }

  private doLogout = () => {
    Axios.post('/api/users/logout', {
      username: this.state.username,
      password: this.state.password
    })
    .finally(() => {
      sessionStorage.setItem('loggedIn', 'false');
      this.setState({loggedIn: false})
      if (WebsocketManager.isWsConnected()) {
        WebsocketManager.disconnect();
      };
      this.props.loggedOutCallback();
    })
  }

  private updateUsername = (event: any) => {
    this.setState({ username: event.target.value })
  }

  private updatePassword = (event: any) => {
    this.setState({ password: event.target.value })
  }

  render(): any {
    return <div className='login'>
      <div className='container mt-5 w-25'>
        <form className='border' id='form'>
          <h4 className='text-center mt-3'>CONTACT US</h4>
          <div className='row ml-4 mr-4'>
            <span>username</span>
          </div>
          <div className='row mb-3 ml-4 mr-4'>
            <input
            type='text'
            id='username'
            className='rounded input-large w-100 border'
            value={this.state.username}
            onChange={this.updateUsername} />
          </div>
          <div className='row ml-4 mr-4'>
            <span>password</span>
          </div>
          <div className='row mb-3 ml-4 mr-4'>
            <input
            type='text'
            id='password'
            className='rounded w-100 border'
            value={this.state.password}
            onChange={this.updatePassword}/>
          </div>
          <div className='mb-3 row ml-4 w-50'>
            <button type='button' onClick={this.doRegister} 
            hidden={this.state.loggedIn}>Register</button>
            <button type='button' onClick={this.doLogin} 
            hidden={this.state.loggedIn}>Login</button>
            <button type='button' onClick={this.doLogout}>Logout</button>
          </div>
        </form>
      </div>
    </div>
  }
}

export default Login;
