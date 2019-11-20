import React from 'react';
import './Square.css'
import {calculateCoordinatesFromFullIndex} from '../../helpers/HelperFunctions'

const blackSquare = 'black-square';
const redSquare = 'red-square';
let lastColor: string = blackSquare;

class Square extends React.Component<
  {index: number,
   potential: boolean,
   moveHandler: (longIndex: number) => void}> {

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

  render(): any {
    let squareClasses = this.calculateColor(this.props.index);
    squareClasses += ' square';
    if (this.props.potential) {
      squareClasses += ' potential';
    }
    const coordinates = calculateCoordinatesFromFullIndex(this.props.index);

    return <div className={squareClasses} style={coordinates}
     onClick={() => this.props.moveHandler(this.props.index)}></div>
  }
}

export default Square;