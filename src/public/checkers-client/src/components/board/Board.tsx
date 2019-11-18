import React from 'react';
import './Board.css';
import Piece from '../piece/Piece';
import Square from '../square/Square';
import {range} from '../../helpers/HelperFunctions'


class Board extends React.Component<{}> {

  render(): any {
    const squares: any  = [];
    for (let i:number = 0; i< 64; i++) {
      const square = <Square key={i} index={i}></Square>
      squares.push(square)
    }

    const redPieces: any = [];
    const blackPieces: any = [];

    const blackRange: number[] = range(0, 12);
    const redRange: number[] = range(20,32); 

    for (let i:number = 0; i < blackRange.length; i++) {
      const index = blackRange[i];
      const piece = <Piece key={i} index={index} black={true} ></Piece>;
      blackPieces.push(piece);
    }

    for (let i:number = 0; i < redRange.length; i++) {
      const index = redRange[i]; 
      const piece = <Piece key={i} black={false} index={index}></Piece>
      redPieces.push(piece)
    }

    return <div className='text-center' >
      <div className='width-container'>
        <div className='grid border border-dark '>
          {squares}
          {blackPieces}
          {redPieces}
        </div>
      </div> 
    </div>
  }
}

export default Board;