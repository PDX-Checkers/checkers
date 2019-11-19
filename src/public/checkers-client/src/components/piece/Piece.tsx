import React from 'react';
import './Piece.css'
import {calculateCoordinatesFromShortIndex} from '../../helpers/HelperFunctions'

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

class Piece extends React.Component<{black: boolean, index: number, king: boolean}> {
    render(): any {
    const color: string = this.props.black ? 'black-piece' : 'red-piece';
    const king: string = this.props.king ? 'king' : '';
    const pieceClasses = `${color} ${king} piece`;
    const coordinates = calculateCoordinatesFromShortIndex(this.props.index);

    return <div className={pieceClasses} style={coordinates}></div>
  }
}

export default Piece;