import React from 'react';
import { mount } from 'enzyme';
import Game from './Game';

const defaultProps: {id: string,
  name: string,
  joinGameCallback:
  (id: string) => void,
  hidden: boolean,
  joinable: boolean } = {
  id: 'DefaultId',
  name: 'DefaultName',
  joinGameCallback: (id: string) => {},
  hidden: false,
  joinable: true
}

function makeDefaultElement(): any {
  return makeElement(defaultProps);
}

// Why doesn't Typescript like me assigning a type of React.Component?
// Weird and bad
function makeElement(props: any): any {
  return <Game hidden={props.hidden}
    id={props.id}
    name={props.name}
    joinGameCallback={props.joinGameCallback}
    joinable={props.joinable}></Game>;
}

describe('Game element', () => {
  it('is not hidden if hidden is false', () => {
    const wrapper = mount(makeDefaultElement());
    expect(wrapper.prop('hidden')).toBe(false);
  });

  it('is hidden if hidden is true', () => {
    const props = defaultProps;
    props.hidden = true;
    const wrapper = mount(makeElement(props));
    expect(wrapper.prop('hidden')).toBe(true);
  });

  it('prints out a message saying "Play against X" where x is the name', () => {
    const wrapper = mount(makeDefaultElement());
    expect(wrapper.text()).toBe(`Play against ${defaultProps.name}`);
  });

  it(`prints out a message saying "Spectate X's game" where x is the name`, () => {
    const props = defaultProps;
    defaultProps.joinable = false;
    const wrapper = mount(makeElement(props));
    expect(wrapper.text()).toBe(`Spectate ${props.name}'s game`);
  });

  it('calls the join game callback if the user clicks the button', () => {
    const props = defaultProps;
    props.joinGameCallback = jest.fn((id: string) => {});
    const wrapper = mount(makeElement(props));
    const button = wrapper.find('button');
    button.simulate('click');
    expect(props.joinGameCallback).toHaveBeenCalledWith(props.id);
  })
});