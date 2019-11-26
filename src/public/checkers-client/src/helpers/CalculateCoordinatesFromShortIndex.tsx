import calculateCoordinatesFromFullIndex from './CalculateCoordinatesFromFullIndex';

function calculateCoordinatesFromShortIndex(index: number): any {
  let fullIndex = index * 2;
  if (Math.floor(index/4) % 2 === 0) {
    fullIndex += 1;
  }
  return calculateCoordinatesFromFullIndex(fullIndex);
}

export default calculateCoordinatesFromShortIndex;