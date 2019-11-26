import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import GamesBrowser from './GamesBrowser';
import { PlayerColor } from '../board/Board'
import { WebsocketManager } from '../../websocketManager'

const defaultProps: { gameStartedCallback: (boardState: any, playerColor: PlayerColor) => void,
  loggedIn: boolean,
  gameInProgress: boolean} = {
  loggedIn: false,
  gameStartedCallback: (boardState: any, playerColor: PlayerColor) => {},
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

function createGame(wrapper: ReactWrapper): ReactWrapper {
  return wrapper.find('#create-game');
}

function getGames(wrapper: ReactWrapper): ReactWrapper {
  return wrapper.find('#get-games');
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

  // Why doesn't his work? Revisit later
  // it('hides the buttons if state.inGame is true', () => {
  //   WebsocketManager.setOnMessage = jest.fn();
  //   WebsocketManager.setOnClose = jest.fn();

  //   const props = defaultProps;
  //   props.loggedIn = true;
  //   const wrapper = mount(makeElement(props));
  //   expect(getGames(wrapper).text()).toBe('Get Games');
  //   expect(getGames(wrapper).prop('hidden')).toBe(false);
  //   expect(createGame(wrapper).text()).toBe('Create Game');
  //   expect(createGame(wrapper).prop('hidden')).toBe(false);

  //   wrapper.setState({inGame: true});
  //   expect(getGames(wrapper).prop('hidden')).toBe(true);
  //   expect(createGame(wrapper).prop('hidden')).toBe(true);
  // });
});