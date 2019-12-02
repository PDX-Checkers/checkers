import React from 'react';
import { WebsocketManager } from '../../websocketManager';
import Game from '../game/Game';
import { PlayerColor } from '../board/Board';

class GamesBrowser extends React.Component<{
    gameStartedCallback: (boardState: any, playerColor: PlayerColor) => void,
    loggedIn: boolean,
    gameInProgress: boolean},
  {inGame: boolean,
    joinableGames: any[],
    spectatableGames: any[]}> {

  constructor(props: any) {
    super(props);

    this.handleLobbyResponses = this.handleLobbyResponses.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);

    this.state = {
      joinableGames: [],
      spectatableGames: [],
      inGame: false
    }
  }

  private handleLobbyResponses(event: any) {
    const response: any = JSON.parse(event.data);
    if (response.response_type === 'created_game') {
      this.setState({inGame: true});
    } else if (response.response_type === 'joined_game') {
      this.props.gameStartedCallback(
        response.board_state, this.state.inGame ? PlayerColor.BLACK : PlayerColor.RED);
      this.setState({
        joinableGames: [],
        spectatableGames: [],
        inGame: false
      });
    } else if (response.response_type === 'spectated_game') {
      this.props.gameStartedCallback(response.board_state, PlayerColor.SPECTATOR);
      this.setState({
        joinableGames: [],
        spectatableGames: [],
        inGame: false
      });
    } else if (response.response_type === 'active_games') {
      this.setState({
        joinableGames: (response.games as any[]).filter(g => typeof g[1].redID === 'undefined'),
        spectatableGames: response.games
      });
    }
  }

  private handleOnClose(event: any) {
    this.setState({
      joinableGames: [],
      spectatableGames: [],
      inGame: false
    });
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

  private spectateGame(id: string) {
    if (WebsocketManager.isWsConnected()) {
      WebsocketManager.sendMessage({request_type: 'spectate_game', gameID: id})
    } else {
      alert('Please login before you spectate a game');
    }
  }

  private getElementsFromJoinableGames(): any[] {
    const elements: any[] = [];
    this.state.joinableGames.forEach(game => {
      const button = <Game id={game[0]} name={game[1].blackID} key={game[0]}
      joinGameCallback={this.joinGame} hidden={this.state.inGame} joinable={true}/>;
      elements.push(button);
    });
    return elements;
  }

  private getElementsFromSpectableGames(): any[] {
    const elements: any[] = [];
    this.state.spectatableGames.forEach(game => {
      const button = <Game id={game[0]} name={game[1].blackID} key={game[0]}
      joinGameCallback={this.spectateGame} hidden={this.state.inGame} joinable={false}/>;
      elements.push(button);
    });
    return elements;
  };

  private getGames() {
    WebsocketManager.sendMessage({request_type: 'get_games'});
  }

  render() {
    if (this.props.gameInProgress || !this.props.loggedIn) {
      return <div></div>
    }

    let joinableGames;
    let spectableGames;
    WebsocketManager.setOnMessage(this.handleLobbyResponses);
    WebsocketManager.setOnClose(this.handleOnClose);
    if (this.state.joinableGames.length !== 0) {
      joinableGames = this.getElementsFromJoinableGames();
    }
    if (this.state.spectatableGames.length !== 0) {
      spectableGames = this.getElementsFromSpectableGames();
    }

    return <div className='container'>
      <div className='row justify-content-center'>
        <button type='button' onClick={() => this.createGame()}
          className='btn btn-primary m-2' id='create-game'
          hidden={this.state.inGame}>Create Game</button>
        <button type='button' onClick={() => this.getGames()}
          className='btn btn-secondary m-2' id='get-games'
          hidden={this.state.inGame}>Get Games</button>
      </div>
      {joinableGames}
      {spectableGames}
    </div>
  }
}

export default GamesBrowser;