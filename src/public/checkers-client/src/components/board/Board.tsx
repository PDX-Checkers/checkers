import React from 'react';
import './Board.css'

class Square extends React.Component<{index: number}> {
  calculateCoordinates(index: number): any {
    const row = Math.floor(index / 8) + 1;
    const column = index % 8 + 1;

    return {
      '--row': `${row}/${row+1}`,
      '--column': `${column}/${column+1}`
    };
  }

  render(): any {
    let squareColor = this.props.index % 2 ? 'red-square' : 'black-square';
    squareColor += ' square'

    const coordinates = this.calculateCoordinates(this.props.index);

    return <div className={squareColor} style={coordinates}></div>;
  }
}

class Piece extends React.Component<{}> {

}

class Board extends React.Component<{}> {

  render(): any {
    const squares: any  = [];
    for (var i:number = 0; i< 64; i++) {
      const square = <Square key={i} index={i}></Square>
      squares.push(square)
    }

    return <div className='text-center' >
      <div className='width-container'>
        <div className='grid border border-dark '>
          {squares}
        </div>
      </div> 
    </div>
  }
}

export default Board