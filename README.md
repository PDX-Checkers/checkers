# Checkers

PDX-Checkers is a full-stack web application that implements a checkers game
server. It implements the following:

* User account creation and authentication.
* Creating a game, and joining existing games.
* Playing a game, complete with promotion, double / triple / n-jumps, and
forced capture.
* End-game detection, including stalemate.

## Building

There's the easy way and the hard way.

### Very Easy Way with Docker

Clone the repo, go to the `docker` folder, and run `make`. Then run `bash
run_docker.sh &` to build and start the server. Note that this is not
persistent, as the container will remove itself after termination.

    git clone https://github.com/PDX-Checkers/checkers.git
    pushd checkers/docker
    make
    bash run_docker.sh &
    popd

### On your Host Machine

Clone the repo, run `npm install` to install dependencies, `npm run build` to
build the server, and `npm run start` to start the server.

    git clone https://github.com/PDX-Checkers/checkers.git
    pushd checkers
    npm install
    npm run build
    npm run start
    popd

### Accessing the Application

However you decide to build it, the server is running on Port 3000. On your
host machine, opening your web browser to `http://localhost:3000` will bring
you to the login / registration window.

## Important Wiki Pages

* [Program Organization](https://github.com/PDX-Checkers/checkers/wiki/Program-Organization), 
describing the architecture of the program.
* [Checkerboard Numbering](https://github.com/PDX-Checkers/checkers/wiki/Checkerboard-Numbering), 
describing how the move notation works.
* [API Reference](https://github.com/PDX-Checkers/checkers/wiki/API-Reference),
describing how to interact with the WebSocket API.