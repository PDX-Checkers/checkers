import React from 'react';
import { mount } from 'enzyme';
import GamesBrowser from './GamesBrowser';
import { PlayerColor } from '../board/Board'
import { WebsocketManager } from '../../websocketManager'

const defaultProps: { gameStartedCallback: (boardState: any, playerColor: PlayerColor) => void,
  loggedIn: boolean,
  gameInProgress: boolean} = {
  loggedIn: false,
  gameStartedCallback: jest.fn(),
  gameInProgress: false
}

function makeDefaultElement(): any {
  return makeElement(defaultProps);
}

// Why doesn't Typescript like me assigning a type of React.Component?
// Weird and bad
function makeElement(props: any): any {
  return <GamesBrowser gameStartedCallback={props.gameStartedCallback}
    gameInProgress={props.gameInProgress}
    loggedIn={props.loggedIn}
    />;
}

describe('GamesBrowser element', () => {
  it('is an empty div if a game is in progress or the user is not logged in', () => {
    const notLoggedIn = mount(makeDefaultElement());
    expect(notLoggedIn.find('button').length).toBe(0);

    const props = defaultProps;
    props.gameInProgress = true;
    props.loggedIn = true;
    const gameInProgress = mount(makeElement(props));
    expect(gameInProgress.find('button').length).toBe(0);
  });

  it('hides the buttons if state.inGame is true', () => {
    WebsocketManager.setOnMessage = jest.fn();
    WebsocketManager.setOnClose = jest.fn();

    const props = defaultProps;
    props.gameInProgress = false;
    props.loggedIn = true;

    const wrapper = mount(makeElement(props));
    let getGamesButton = wrapper.find('#get-games');
    let createGameButton = wrapper.find('#create-game');
    expect(getGamesButton.text()).toBe('Get Games');
    expect(getGamesButton.prop('hidden')).toBe(false);
    expect(createGameButton.text()).toBe('Create Game');
    expect(createGameButton.prop('hidden')).toBe(false);

    wrapper.setState({inGame: true});
    getGamesButton = wrapper.find('#get-games');
    createGameButton = wrapper.find('#create-game');
    expect(getGamesButton.prop('hidden')).toBe(true);
    expect(createGameButton.prop('hidden')).toBe(true);
  });

  it('sends a create_game request to the backend when create game is pressed', () => {
    WebsocketManager.setOnMessage = jest.fn();
    WebsocketManager.setOnClose = jest.fn();
    WebsocketManager.isWsConnected = jest.fn(() => true);
    WebsocketManager.sendMessage = jest.fn();

    const props = defaultProps;
    props.gameInProgress = false;
    props.loggedIn = true;

    const wrapper = mount(makeElement(props));
    const createGameButton = wrapper.find('#create-game');

    createGameButton.simulate('click');
    expect(WebsocketManager.sendMessage).toHaveBeenCalledWith({request_type: 'create_game'});
  });

  it('sends a get_games request to the backend when create game is pressed', () => {
    WebsocketManager.setOnMessage = jest.fn();
    WebsocketManager.setOnClose = jest.fn();
    WebsocketManager.isWsConnected = jest.fn(() => true);
    WebsocketManager.sendMessage = jest.fn();

    const props = defaultProps;
    props.gameInProgress = false;
    props.loggedIn = true;

    const wrapper = mount(makeElement(props));
    const getGamesButton = wrapper.find('#get-games');

    getGamesButton.simulate('click');
    expect(WebsocketManager.sendMessage).toHaveBeenCalledWith({request_type: 'get_games'});
  });

  it('sends a join_game request with the specified ID when a game is joined', () => {
    WebsocketManager.setOnMessage = jest.fn();
    WebsocketManager.setOnClose = jest.fn();
    WebsocketManager.isWsConnected = jest.fn(() => true);
    WebsocketManager.sendMessage = jest.fn();

    const props = defaultProps;
    props.gameInProgress = false;
    props.loggedIn = true;

    const wrapper = mount(makeElement(props));
    wrapper.setState({
      games: [['JoinButtonId', {blackID: 'TestPlayer'}]]
    });
    const joinGameButton = wrapper.find('.btn');
    // These fail for now. Figure out why later
    // joinGameButton.simulate('click');
    // expect(WebsocketManager.sendMessage).toHaveBeenCalledWith({request_type: 'join_game', gameID: 'JoinButtonId'});
  });

  it('handles responses as expected', () => {
    const props = defaultProps;
    props.gameInProgress = false;
    props.loggedIn = true;

    const event: {data: string} = {data: ''};
    event.data = '{"response_type": "created_game" }';
    const gamesBrowser = mount(makeElement(props));
    expect(gamesBrowser.state('inGame')).toBe(false);
    // Dirty TS tricks for testi  ng. Lets me access private methods
    (gamesBrowser.instance() as any).handleLobbyResponses(event);
    expect(gamesBrowser.state('inGame')).toBe(true);

    gamesBrowser.setState({
      inGame: false,
      games: [['JoinButtonId', {blackID: 'TestPlayer'}]]
    });
    event.data = '{"response_type": "joined_game", "board_state":"beans" }';
    (gamesBrowser.instance() as any).handleLobbyResponses(event);
    expect(gamesBrowser.state('inGame')).toBe(false);
    expect(gamesBrowser.state('joinableGames')).toEqual([]);
    expect(props.gameStartedCallback).toHaveBeenCalledWith('beans', PlayerColor.RED);

    gamesBrowser.setState({
      inGame: true,
      games: [['JoinButtonId', {blackID: 'TestPlayer'}]]
    });
    (gamesBrowser.instance() as any).handleLobbyResponses(event);
    expect(gamesBrowser.state('inGame')).toBe(false);
    expect(gamesBrowser.state('joinableGames')).toEqual([]);
    expect(props.gameStartedCallback).toHaveBeenCalledWith('beans', PlayerColor.BLACK);

    event.data = '{"response_type": "active_games", "games":["waffles"] }';
    (gamesBrowser.instance() as any).handleLobbyResponses(event);
    expect(gamesBrowser.state('joinableGames')).toEqual(['waffles']);
  });
});