import React from 'react';
import { mount } from 'enzyme';
import Login from './Login';
import Axios from 'axios';
import { WebsocketManager } from '../../websocketManager'

jest.mock('axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

const defaultProps: {  loggedInCallback: () => void,
  loggedOutCallback: () => void } = {
  loggedInCallback: () => {},
  loggedOutCallback: () => {}
}

function makeDefaultElement(): any {
  return makeElement(defaultProps);
}

const waitForPromises = () => new Promise(setImmediate);

class LocalStorage implements Storage {
  store: Map<string,string>;
  length: number;
  key: any;

  constructor() {
    this.store = new Map<string, string>();
    this.length = 0;
  }

  getItem(key: string) {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
    this.length = this.store.size;
  }

  clear() {
    this.store.clear();
  }

  removeItem(key: string) {
    this.store.delete(key);
  }
}

// Why doesn't Typescript like me assigning a type of React.Component?
// Weird and bad
function makeElement(props: any): any {
  return <Login loggedInCallback={props.loggedInCallback}
    loggedOutCallback={props.loggedOutCallback}></Login>;
}

describe('Login element', () => {

  it('Logs you in if you press the login button', async () => {
    mockedAxios.post.mockResolvedValue({data: {}});
    WebsocketManager.connect = jest.fn();

    (global as any).localstorage = new LocalStorage();
    const props = defaultProps;
    props.loggedInCallback = jest.fn();
    const wrapper = mount(makeElement(props));

    const button = wrapper.find('#login-button');
    button.simulate('click');

    await waitForPromises();

    expect(sessionStorage.getItem('loggedIn')).toBe('true');
    expect(wrapper.state('loggedIn')).toBe(true);
    expect(props.loggedInCallback).toHaveBeenCalled();
    expect(WebsocketManager.connect).toHaveBeenCalled();
  });

  it('logs you out if you press the logout button', async () => {
    mockedAxios.post.mockResolvedValue({data: {}});
    WebsocketManager.isWsConnected = jest.fn((): boolean => true);
    WebsocketManager.disconnect = jest.fn();

    (global as any).localstorage = new LocalStorage();
    const props = defaultProps;
    props.loggedOutCallback = jest.fn();
    const wrapper = mount(makeElement(props));

    const button = wrapper.find('#logout-button');
    button.simulate('click');

    await waitForPromises();

    expect(sessionStorage.getItem('loggedIn')).toBe('false');
    expect(wrapper.state('loggedIn')).toBe(false);
    expect(props.loggedOutCallback).toHaveBeenCalled();
    expect(WebsocketManager.disconnect).toHaveBeenCalled();
  });
});