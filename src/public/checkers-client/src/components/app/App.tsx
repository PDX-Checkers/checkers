import React from 'react';
import Login from '../login/Login';
import GamesBrowser from '../gamesBrowser/GamesBrowser';
import Board, { PlayerColor } from '../board/Board';

class App extends React.Component<{},
  {loggedIn: boolean, boardState: any, playerColor: PlayerColor}> {

  constructor(props: any) {
    super(props);

    this.updateGameCallback = this.updateGameCallback.bind(this);
    this.loggedInCallback = this.loggedInCallback.bind(this);

    this.state = {
      loggedIn: false,
      playerColor: PlayerColor.NOT_SET,
      boardState: undefined
    }
  }

  private updateGameCallback(boardState: any, playerColor: PlayerColor) {
    this.setState({
      boardState,
      playerColor
    })
  }

  private loggedInCallback() {
    this.setState({
      loggedIn: true
    })
  }

  render() {
  return <div>
      <div id='login'>
        <Login loggedInCallback={this.loggedInCallback}/>
      </div>
      <div id='games-container'>
        <GamesBrowser 
        gameStartedCallback={(boardState:any, playerColor: PlayerColor) =>
          this.updateGameCallback(boardState, playerColor)}
        loggedIn={this.state.loggedIn}/>
      </div>
      <div id='board-container' className='mt-5 mb-5'>
        <Board boardState={this.state.boardState} playerColor={this.state.playerColor}
        updateGameCallback={(boardState:any, playerColor: PlayerColor) =>
          this.updateGameCallback(boardState, playerColor)}/>
      </div>
    </div>
  }
}

export default App;