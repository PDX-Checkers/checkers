import React from 'react';
import Login from '../login/Login';
import GamesBrowser from '../gamesBrowser/GamesBrowser';
import Board, { PlayerColor } from '../board/Board';
import isLoggedIn from '../../helpers/IsLoggedIn';

class App extends React.Component<{},
  {loggedIn: boolean,
   boardState: any,
   playerColor: PlayerColor,
   gameInProgress: boolean}> {

  constructor(props: any) {
    super(props);

    this.gameStartedCallback = this.gameStartedCallback.bind(this);
    this.loggedInCallback = this.loggedInCallback.bind(this);
    this.loggedOutCallback = this.loggedOutCallback.bind(this);
    this.gameCompleteCallback = this.gameCompleteCallback.bind(this);

    this.state = {
      loggedIn: isLoggedIn(),
      playerColor: PlayerColor.NOT_SET,
      boardState: undefined,
      gameInProgress: false
    }
  }

  private gameStartedCallback(boardState: any, playerColor: PlayerColor) {
    this.setState({
      boardState,
      playerColor,
      gameInProgress: true
    })
  }

  private gameCompleteCallback() {
    this.setState({
      boardState: undefined,
      playerColor: PlayerColor.NOT_SET,
      gameInProgress: false
    })
  }

  private loggedInCallback() {
    this.setState({
      loggedIn: true
    })
  }

  private loggedOutCallback() {
    this.setState({
      loggedIn: false,
      playerColor: PlayerColor.NOT_SET,
      boardState: undefined,
      gameInProgress: false
    })
  }

  render() {
  return <div>
      <div id='login' className='m-2'>
        <Login loggedInCallback={this.loggedInCallback} loggedOutCallback={this.loggedOutCallback}/>
      </div>
      <div id='games-container'className='m-2'>
        <GamesBrowser 
        gameStartedCallback={(boardState:any, playerColor: PlayerColor) =>
          this.gameStartedCallback(boardState, playerColor)}
        loggedIn={this.state.loggedIn}
        gameInProgress={this.state.gameInProgress}/>
      </div>
      <div id='board-container' className='mt-5 mb-5'>
        <Board boardState={this.state.boardState}
         playerColor={this.state.playerColor}
         gameCompleteCallback={this.gameCompleteCallback}/>
      </div>
    </div>
  }
}

export default App;