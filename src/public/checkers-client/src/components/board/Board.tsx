import React from 'react';
import './Board.css'
import { number } from 'prop-types';

const blackSquare = 'black-square';
const redSquare = 'red-square';
let lastColor: string = blackSquare;

// Generates a range of number from start to end exclusive
function range(start: number, end: number): number[] {
  return Array.from({length: (end - start)}, (v, k) => k + start);
}

function calculateCoordinatesFromFullIndex(index: number): any {
  const row = Math.floor(index/8) + 1;
  const column = index % 8 + 1;

  return {
    '--row': `${row}/${row+1}`,
    '--column': `${column}/${column+1}`
  };
}
function calculateCoordinatesFromShortIndex(index: number): any {
  let fullIndex = index * 2;
  if (Math.floor(index/4) % 2 === 0) {
    fullIndex += 1;
  }
  return calculateCoordinatesFromFullIndex(fullIndex);
}

class Square extends React.Component<{index: number}> {
  nextColor(color: string): string {
    if (color === blackSquare) {
      return redSquare;
    }
    return blackSquare;
  }

  calculateColor(index: number): string {
     const useLastColor = index % 8 === 0;
     if (useLastColor) {
       return lastColor;
     }
     lastColor = this.nextColor(lastColor);
     return lastColor;
  }

  drop(event: any) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    event.target.appendChild(document.getElementById(data));
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  render(): any {
    let squareClasses = this.calculateColor(this.props.index);
    squareClasses += ' square'
    const coordinates = calculateCoordinatesFromFullIndex(this.props.index);
    const drop = this.drop;
    const dragover = this.allowDrop;

    return lastColor === redSquare ? 
    <div className={squareClasses} style={coordinates} onDrop={drop} onDragOver={dragover}></div> :
    <div className={squareClasses} style={coordinates}></div>;
  }
}

// We number the board indices as follows:
//     0   1   2   3
//   4   5   6   7
//     8   9  10  11
//  12  13  14  15
//    16  17  18  19
//  20  21  22  23
//    24  25  26  27
//  28  29  30  31
// Starting the game, Black occupies the top three rows. Red occupies the bottom
// three rows.

class Piece extends React.Component<{black: boolean, index: number}> {
  drag(event: any) {
    event.dataTransfer.setData("text", event.target.id);
  }
  //  draggable={true} onDragStart={drag}
  render(): any {
    const color: string = this.props.black ? 'black-piece' : 'red-piece';
    const pieceClasses = color + ' piece';
    const coordinates = calculateCoordinatesFromShortIndex(this.props.index);

    return <div className={pieceClasses} style={coordinates}></div>
  }
}

class Board extends React.Component<{}> {

  render(): any {
    const squares: any  = [];
    for (var i:number = 0; i< 64; i++) {
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

export default Board