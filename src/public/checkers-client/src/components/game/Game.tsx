import React from 'react';

class Game extends React.Component<{
  id: string,
  name: string,
  joinGameCallback: (id: string) => void,
  hidden: boolean}> {

  render() {
    return <div className='row justify-content-center' test-id='game'>
      <button hidden={this.props.hidden} className='btn btn-info'
      onClick={() => this.props.joinGameCallback(this.props.id)}>
        Play against {this.props.name}
      </button>
    </div>
  }
}

export default Game;