import React from 'react';

class Game extends React.Component<{
  id: string,
  name: string,
  joinGameCallback: (id: string) => void,
  hidden: boolean,
  joinable: boolean}> {

  render() {
    let message;
    let classes;
    if (this.props.joinable) {
      message = `Play against ${this.props.name}`
      classes = 'btn btn-info'
    } else {
      message = `Spectate ${this.props.name}'s game`
      classes = 'btn btn-warning'
    }

    return <div className='row justify-content-center' test-id='game'>
      <button hidden={this.props.hidden} className={classes}
      onClick={() => this.props.joinGameCallback(this.props.id)}>
        {message}
      </button>
    </div>
  }
}

export default Game;