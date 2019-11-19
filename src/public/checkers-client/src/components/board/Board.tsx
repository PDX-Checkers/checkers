import React from 'react';
import './Board.css';
import Piece from '../piece/Piece';
import Square from '../square/Square';
import { GameBoard, fromObject } from '../../helpers/GameBoard';
import { WebsocketManager } from '../../websocketManager'

export enum PlayerColor {
  RED,
  BLACK,
  NOT_SET
}

const board = new GameBoard();

class Board extends React.Component<{
  playerColor: PlayerColor,
  boardState: any,
  updateGameCallback: (boardState: any, playerColor: PlayerColor) => (void)}> {

  constructor(props: any) {
    super(props);

    this.handleGameResponses = this.handleGameResponses.bind(this);
  }

  private handleGameResponses(event: any) {
    const response: any = JSON.parse(event.data);
  }

  render(): any {
    let board: any = <div></div>;
    if (this.props.boardState) {
    // if (true){
      const gameBoard: GameBoard = fromObject(this.props.boardState);

      WebsocketManager.setOnMessage(this.handleGameResponses);

      const squares: any  = [];
      for (let i:number = 0; i< 64; i++) {
        const square = <Square key={i} index={i}></Square>
        squares.push(square)
      }

      const rawPieces: any[] = this.props.boardState.board;
      // const rawPieces = [3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1];

      const pieces: any[] = [];

      for (let i:number = 0; i < rawPieces.length; i++) {
        if (rawPieces[i] === 0) {
          continue;
        }
        const black: boolean = rawPieces[i] > 2;
        const king: boolean = rawPieces[i] % 2 === 0
        const piece = <Piece key={i} index={i} black={black} king={king}></Piece>;
        pieces.push(piece);
      }

      board = <div className='text-center' hidden={false}>
      <div className='width-container'>
        <div className='grid border border-dark '>
          {squares}
          {pieces}
        </div>
      </div>
    </div>
    }
    return board;
  }
}

export default Board;