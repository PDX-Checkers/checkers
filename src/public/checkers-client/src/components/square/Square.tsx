import React from 'react';
import './Square.css'
import {calculateCoordinatesFromFullIndex} from '../../helpers/HelperFunctions'

const blackSquare = 'black-square';
const redSquare = 'red-square';
let lastColor: string = blackSquare;

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

export default Square;