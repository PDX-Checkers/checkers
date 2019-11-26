import isLoggedIn from './IsLoggedIn';
import calculateCoordinatesFromFullIndex from './CalculateCoordinatesFromFullIndex';
import calculateCoordinatesFromShortIndex from './CalculateCoordinatesFromShortIndex';
import * as FullCalc from './CalculateCoordinatesFromFullIndex';
import { randomNumber } from './TestHelpers'

const MAX_INDEX = 64;

describe('isloggedIn()', () => {
  it('returns false if the session storage has loggedIn not set', () => {
    expect(isLoggedIn()).toBe(false);
  });

  it('returns false if the session storage has loggedIn set to anything but true', () => {
    sessionStorage.setItem('loggedIn', 'Beans');
    expect(isLoggedIn()).toBe(false);
  });

  it('returns true if the session storage had loggedIn set to true', () => {
    sessionStorage.setItem('loggedIn', 'true');
    expect(isLoggedIn()).toBe(true);
  });
});

describe('calculateCoordinatesFromFullIndex', () => {
  it(`returns the row and column values in a css-like object, with row
   set to the index/8 + 1, and column set to index % 8 + 1`, () => {
    const index = randomNumber(MAX_INDEX);
    const row = Math.floor(index/8) + 1;
    const column = index % 8 + 1;
    const expected = {
      '--row': `${row}/${row+1}`,
      '--column': `${column}/${column+1}`
    };

    expect(calculateCoordinatesFromFullIndex(index)).toStrictEqual(expected);
   });
});

describe('calculateCoordinatesFromShortIndex', () => {
  it(`calls out to calculateCoordinatesFromFullIndex after doubling the index and 
   adding one if (index/4) % 2 === 0`, () => {
    const index = randomNumber(MAX_INDEX/2);
    let fullIndex = index * 2;
    if (Math.floor(index/4) % 2 === 0) {
      fullIndex += 1;
    }
    const fullSpy = jest.spyOn(FullCalc, 'default');
    calculateCoordinatesFromShortIndex(index);
    if ((index/4) % 2 !== 0) {
      expect(fullSpy).toHaveBeenCalledWith(fullIndex);
    } else {
      expect(fullSpy).toHaveBeenCalledWith(fullIndex);
    }
   });
});