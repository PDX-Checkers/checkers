import React from 'react';
import { mount } from 'enzyme';
import Square from './Square';

const defaultProps: { index: number,
  moveHandler: (longIndex: number) => void } = {
  index: -1,
  moveHandler: jest.fn()
}

function makeDefaultElement(): any {
  return makeElement(defaultProps);
}

// Why doesn't Typescript like me assigning a type of React.Component?
// Weird and bad
function makeElement(props: any): any {
  return <Square index={props.index}
  moveHandler={props.moveHandler}
  />
}

describe('Square element', () => {
  it('calls the passed in handler if the square is clicked on', () => {
    const wrapper = mount(makeDefaultElement());
    const square = wrapper.find('div');

    square.simulate('click');

    expect(defaultProps.moveHandler).toHaveBeenCalledWith(defaultProps.index);
  });
});

describe('nextColor()', () => {
  const blackSquare = 'black-square';
  const redSquare = 'red-square';

  it('return the alternate color from whatever was passed in', () => {
    const wrapper = mount(makeDefaultElement());

    expect((wrapper.instance() as any).nextColor(redSquare)).toBe(blackSquare);
    expect((wrapper.instance() as any).nextColor(blackSquare)).toBe(redSquare);
  })
});