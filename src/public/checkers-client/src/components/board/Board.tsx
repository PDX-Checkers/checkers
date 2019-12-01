import React from 'react';
import './Board.css';
import Piece from '../piece/Piece';
import Square from '../square/Square';
import { GameBoard, fromObject } from '../../helpers/GameBoard';
import { WebsocketManager } from '../../websocketManager'

export enum PlayerColor {
  RED,
  BLACK,
  NOT_SET,
  SPECTATOR
}

class Board extends React.Component<{
  playerColor: PlayerColor,
  boardState: any,
  gameCompleteCallback: () => void},
  {boardState: any,
   selectedPiece: number,
   gameDone: boolean}> {

  constructor(props: any) {
    super(props);

    this.handleGameResponses = this.handleGameResponses.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.doMove = this.doMove.bind(this);
    this.returnToLobby = this.returnToLobby.bind(this);
    this.leaveGame = this.leaveGame.bind(this);

    this.state = {
      boardState: undefined,
      selectedPiece: -1,
      gameDone: false
    }
  }

  private handleGameResponses(event: any) {
    const response: any = JSON.parse(event.data);
    if (response.response_type === 'valid_move') {
      if (response.board_state.gameState.currentState === 'CompleteGame') {
        this.setState({
          gameDone: true,
          boardState: response.board_state,
          selectedPiece: -1
        });
      }
      else {
        this.setState({
          boardState: response.board_state,
          selectedPiece: -1
        });
      }
    }
  }

  // Handler for when the user clicks on a given piece to see possible moves
  private selectHandler(shortIndex: number) {
    this.setState({
      selectedPiece: shortIndex
    });
  }

  private doMove(targetAsLongIndex: number) {
    const targetAsShortIndex = Math.floor(targetAsLongIndex / 2);
    WebsocketManager.sendMessage({
      request_type: 'move',
      move: {
        source: this.state.selectedPiece,
        target: targetAsShortIndex
      }
    })
  }

  private returnToLobby() {
    this.setState({
      boardState: undefined,
      selectedPiece: -1,
      gameDone: false
    });
    this.props.gameCompleteCallback();
  }

  private leaveGame() {
    WebsocketManager.sendMessage({request_type : 'leave_game'});
    this.returnToLobby();
  }

  render(): any {
    let boardHtml: any;
    if (this.props.boardState === undefined && this.state.boardState === undefined) {
      boardHtml = <div></div>;
    }
    else {
      const currentBoardState = this.state.boardState !== undefined
      ? this.state.boardState : this.props.boardState;

      const gameBoard: GameBoard = fromObject(currentBoardState);

      WebsocketManager.setOnMessage(this.handleGameResponses);

      const rawPieces: any[] = currentBoardState.board;

      const pieces: any[] = [];

      let potentialMoves: number[] = [];
      if (this.state.selectedPiece !== -1) {
        potentialMoves = gameBoard.validMoves(this.state.selectedPiece);
        // Map potential moves to long index
        potentialMoves = potentialMoves.map(x => Math.floor(x/4) % 2 === 0 ? x*2+1 : x*2);
      }

      const squares: any  = [];
      for (let i:number = 0; i< 64; i++) {
        const square = <Square key={i} index={i} moveHandler={this.doMove}></Square>;
        squares.push(square);
      }

      for (let i:number = 0; i < rawPieces.length; i++) {
        if (rawPieces[i] === 0) {
          continue;
        }
        const black: boolean = rawPieces[i] > 2;
        const you: boolean = (black && this.props.playerColor === PlayerColor.BLACK) ||
          (!black && this.props.playerColor === PlayerColor.RED);
        const king: boolean = rawPieces[i] % 2 === 0;
        const selected = i === this.state.selectedPiece;
        const piece = <Piece key={i} index={i} black={black} king={king} 
          selectHandler={this.selectHandler} selected={selected} you={you}
          ></Piece>;
        pieces.push(piece);
      }

      const player: string = PlayerColor[this.props.playerColor];
      const currentPlayer: string = this.state.gameDone ? '' : gameBoard.getCurrentPlayerAsString();
      const currentPlayerMessage = this.state.gameDone ? <div></div> :
       <span className='mt-2 mb-2'>It is {currentPlayer}'s turn</span>;
      const playerOrWinnerMessage = this.state.gameDone ? `${player} is the winner!` : `You are ${player}`;
      const backToLobbyButton = this.state.gameDone && this.props.playerColor !== PlayerColor.SPECTATOR ?
        <button className='btn btn-primary m-3' onClick={this.returnToLobby}>Go back to game menu</button> 
        : <div></div>;
      const leaveButton = this.props.playerColor === PlayerColor.SPECTATOR ? 
        <button className='btn btn-warning m-3' onClick={this.leaveGame}>
          Stop spectating game
        </button> : <div></div>;

      boardHtml = <div className='text-center'>
      <div className='width-container'>
        <span className='mt-2 mb-2'>{playerOrWinnerMessage}</span>
        <br></br>
        {currentPlayerMessage}
        {backToLobbyButton}
        {leaveButton}
        <div className='grid border border-dark '>
          {squares}
          {pieces}
        </div>
      </div>
    </div>
    }
    return boardHtml;
  }
}

export default Board;