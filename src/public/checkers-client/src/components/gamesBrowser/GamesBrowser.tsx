import React from 'react';
import { WebsocketManager } from '../../websocketManager';
import Game from '../game/Game';
import { PlayerColor } from '../board/Board';

class GamesBrowser extends React.Component<{
  gameStartedCallback: (boardState: any, playerColor: PlayerColor) => void,
  loggedIn: boolean},
  {inGame: boolean,
   games: any[]}> {

  constructor(props: any) {
    super(props);

    this.handleLobbyResponses = this.handleLobbyResponses.bind(this);

    this.state = {
      inGame: false,
      games: []
    }
  }

  private handleLobbyResponses(event: any) {
    const response: any = JSON.parse(event.data);
    if (response.response_type === 'created_game') {
      WebsocketManager.setOnMessage(this.handleLobbyResponses);
      this.setState({inGame: true});
    } else if (response.response_type === 'joined_game') {
      this.props.gameStartedCallback(
        response.board_state, this.state.inGame ? PlayerColor.BLACK : PlayerColor.RED);
      this.setState({inGame: true});
    } else if (response.response_type === 'active_games') {
      this.setState({
        games: response.games
      });
    }
  }

  private createGame() {
    if (WebsocketManager.isWsConnected()) {
      WebsocketManager.sendMessage({request_type: 'create_game'});
    } else {
      alert('Please login before you create a game');
    }
  }

  private joinGame(id: string) {
    if (WebsocketManager.isWsConnected()) {
      WebsocketManager.sendMessage({request_type: 'join_game', gameID: id});
    } else {
      alert('Please login before you join a game');
    }
  }

  private getElementsFromGames(): any[] {
    const elements: any[] = [];
    this.state.games.forEach(game => {
      const button = <Game id={game[0]} name={game[1].blackID} key={game[0]}
      joinGameCallback={this.joinGame} hidden={this.state.inGame}/>;
      elements.push(button);
    });
    return elements;
  }

  private getGames() {
    WebsocketManager.sendMessage({request_type: 'get_games'});
  }

  private registerWebsocketHandler() {
    WebsocketManager.setOnMessage(this.handleLobbyResponses);
  }

  render() {
    let games;
    if (this.props.loggedIn) {
      this.registerWebsocketHandler();
      if (this.state.games.length !== 0) {
        games = this.getElementsFromGames();
      }
    }

    return <div>
      <button type='button' onClick={() => this.createGame()}
      hidden={this.state.inGame}>Create Game</button>
      <button type='button' onClick={() => this.getGames()}
      hidden={this.state.inGame}>Get Games</button>
      <br></br>
      {games}
    </div>
  }
}

export default GamesBrowser;