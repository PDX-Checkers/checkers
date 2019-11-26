import React from 'react';
import { mount } from 'enzyme';
import Piece from './Piece';
import * as ShortCalc from '../../helpers/CalculateCoordinatesFromShortIndex'

const defaultProps: { black: boolean,
  index: number,
  king: boolean,
  selected: boolean,
  selectHandler: (index: number) => void,
  you: boolean } = {
  index: -1,
  black: false,
  king: false,
  selected: false,
  selectHandler: (index: number) => {},
  you: false
}

function makeDefaultElement(): any {
  return makeElement(defaultProps);
}

// Why doesn't Typescript like me assigning a type of React.Component?
// Weird and bad
function makeElement(props: any): any {
  return <Piece index={props.index}
  selectHandler={props.selectHandler}
  selected={props.selected}
  black={props.black}
  king={props.king}
  you={props.you}/>;
}

describe('Piece element', () => {
  it(`Calls the selectHandler when you click on it and you is true,
      and doesn't do another if you is false`, async () => {
    const props = defaultProps;
    props.selectHandler = jest.fn();
    const notYou = mount(makeElement(props));
    const notYouPiece = notYou.find('div');
    notYouPiece.simulate('click');
    expect(props.selectHandler).not.toHaveBeenCalled();

    props.you = true;
    const you = mount(makeElement(props));
    const youPiece = you.find('div');
    you.simulate('click');
    expect(props.selectHandler).toHaveBeenCalled();
  });

  it('assigns the king class if king is true and doesn\'t if its false', () => {
    const notkingWrapper = mount(makeDefaultElement());
    const notking = notkingWrapper.find('div');
    expect(notking.hasClass('king')).toBe(false);

    const props = defaultProps;
    props.king = true;
    const kingWrapper = mount(makeElement(props));
    const king = kingWrapper.find('div');
    expect(king.hasClass('king')).toBe(true);
  });

  it('assigns the selected class if selected is true and doesn\'t if its false', () => {
    const notSelectedWrapper = mount(makeDefaultElement());
    const notSelected = notSelectedWrapper.find('div');
    expect(notSelected.hasClass('selected')).toBe(false);

    const props = defaultProps;
    props.selected = true;
    const selectedWrapper = mount(makeElement(props));
    const selected = selectedWrapper.find('div');
    expect(selected.hasClass('selected')).toBe(true);
  });

  it('calls out to calculateCoordinatesFromShortIndex to calculate the coordinates', () => {
    const shortSpy = spyOn(ShortCalc, 'default');
    mount(makeDefaultElement());

    expect(shortSpy).toHaveBeenCalledWith(defaultProps.index);
  });

  it('has the class red-piece if black is false and the class black-piece if black is true', () => {
    const redWrapper = mount(makeDefaultElement());
    const red = redWrapper.find('div');
    expect(red.hasClass('red-piece')).toBe(true);

    const props = defaultProps;
    defaultProps.black = true;
    const blackWrapper = mount(makeElement(props));
    const black = blackWrapper.find('div');
    expect(black.hasClass('black-piece')).toBe(true);
  });
});