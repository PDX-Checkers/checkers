import React from 'react';

class Game extends React.Component<{
  id: string,
  name: string,
  joinGameCallback: (id: string) => void,
  hidden: boolean}> {

  render() {
    return <button hidden={this.props.hidden}
    onClick={() => this.props.joinGameCallback(this.props.id)}>
      Play against {this.props.name};
    </button>
  }
}

export default Game;