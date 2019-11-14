import { Board, Color } from "./Board";
import { JSONRequest, parseMessageJSON } from '../JSONClasses/JSONRequest';
import { JSONInvalidMessageResponse, 
         JSONGameStateResponse,
         JSONIsNotYourTurnResponse,
         JSONInvalidMoveResponse,
         JSONValidMoveResponse } from '../JSONClasses/JSONResponse';
import OOPEventWebSocket = require('ws');
import { ActiveGameController, subscribe } from '../controllers/ActiveGameController';
import { Logger } from '@overnightjs/logger';

export class ActiveGame {
    blackID: string;
    redID?: string;
    blackSocket: OOPEventWebSocket;
    redSocket?: OOPEventWebSocket;
    boardState: Board;
    parent: ActiveGameController;

    // The Black player creates the game. The Red player joins the game.
    constructor(parent: ActiveGameController, blackID: string, blackSocket: OOPEventWebSocket, redID?: string, redSocket?: OOPEventWebSocket, board?: Board) {
        this.parent = parent;
        this.blackID = blackID;
        this.redID = redID;
        this.blackSocket = blackSocket;
        this.redSocket = redSocket;
        if(board === undefined) {
            this.boardState = new Board();
        }
        else {
            this.boardState = board.copy();
        }
        blackSocket.send("Created Game");
        this.subscribe(blackSocket, Color.BLACK);
    }

    join(redID: string, redSocket: OOPEventWebSocket) {
        if(this.redID !== undefined || this.redSocket !== undefined) {
            throw "join: redID or redSocket already exist!";
        }
        this.redID = redID;
        this.redSocket = redSocket;
        this.subscribe(redSocket, Color.RED);
        this.sendBoth("joined game");
    }

    private sendBoth(message: string) {
        if(this.redSocket === undefined) {
            throw "sendBoth: sending both when redSocket is undefined!";
        }
        this.blackSocket.send(message);
        this.redSocket.send(message);
    }

    private getSocketColor(socket: OOPEventWebSocket): Color {
        if(socket === this.blackSocket) {
            return Color.BLACK;
        }
        if(socket === this.redSocket) {
            return Color.RED;
        }
        return Color.NO_COLOR;
    }

    public toObject(): object {
        return {
            "blackID" : this.blackID,
            "redID" : this.redID,
            "boardState" : this.boardState.toObject()
        }
    }

    public processMessage(socket: OOPEventWebSocket, color: Color, message: string) {
        // We currently attempt to parse it as one of two things: A get request
        // for the state of the board, or a move request.
        let parsedObj: JSONRequest | null = parseMessageJSON(message);
        if(parsedObj === null) {
            socket.send(
                JSON.stringify(
                    new JSONInvalidMessageResponse("Invalid object").toObject()));
            return;
        }
        if(parsedObj.isStateRequest()) {
            socket.send(JSON.stringify(new JSONGameStateResponse(this).toObject()));
            return;
        }
        // If it's not invalid and it's not a state request, it's a move request.
        else {
            if(this.getSocketColor(socket) !== this.boardState.getCurrentState().color) {
                socket.send(
                    JSON.stringify(
                        new JSONIsNotYourTurnResponse().toObject()));
                return;
            }
            let move: [number, number] | null = parsedObj.getMove();
            if(move === null) {
                socket.send("Something went very, very wrong.");
                return;
            }
            let [source, target]: [number, number] = move;
            let newBoard: Board | null = this.boardState.move(source, target);
            if(newBoard === null) {
                socket.send(
                    JSON.stringify(
                        new JSONInvalidMoveResponse().toObject()));
                return;
            }

            this.boardState = newBoard;
            this.sendBoth(
                JSON.stringify(
                    new JSONValidMoveResponse(this.boardState).toObject()));

            if(this.boardState.isGameOver()) {
                this.finishGame();
            }
        }
    }

    subscribe(ws: OOPEventWebSocket, color: Color) {
        let thisArg: ActiveGame = this;
        ws.removeAllListeners();
        ws.on("message", wsListener(thisArg, ws, color));
        ws.on("close", finishGameEarlyListener(thisArg, color));
    }

    // Once we finish the game, we need to return both websockets to the control of the ActiveGame.
    finishGame() {
        Logger.Info(`Finished Game: ${this.toObject()}`);
        if(isOpen(this.blackSocket)) {
            this.blackSocket.send("Returning to ActiveGameController");
            subscribe(this.parent, this.blackSocket, this.blackID);
        }
        else {
            this.parent.removeUserSocket(this.blackID);
        }
        if(this.redSocket !== undefined && this.redID !== undefined && isOpen(this.redSocket)) {
            this.blackSocket.send("Returning to ActiveGameController");
            subscribe(this.parent, this.redSocket, this.redID);
        }
    }

    finishGameEarly(color: Color) {
        this.boardState = this.boardState.finishEarly(color);
    }

}

function finishGameEarlyListener(game: ActiveGame, color: Color): (() => void) {
    return function() {
        game.finishGameEarly(color);
        game.finishGame();
    }
}

function wsListener(game: ActiveGame, ws: OOPEventWebSocket, color: Color): ((s: string) => void) {
    return function(s: string) { game.processMessage(ws, color, s) };
}

function isOpen(socket: OOPEventWebSocket) {
    return socket.readyState === 1;
}