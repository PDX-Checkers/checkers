import { Board, Color } from "./Board";
import { JSONRequest, parseMessageJSON } from '../JSONClasses/JSONRequest';
import { JSONInvalidMessageResponse, 
         JSONBoardStateResponse,
         JSONIsNotYourTurnResponse,
         JSONInvalidMoveResponse,
         JSONValidMoveResponse } from '../JSONClasses/JSONResponse';

export class ActiveGame {
    blackID: string;
    redID?: string;
    blackSocket: WebSocket;
    redSocket?: WebSocket;
    boardState: Board;

    // The Black player creates the game. The Red player joins the game.
    constructor(blackID: string, blackSocket: WebSocket) {
        this.blackID = blackID;
        this.redID = undefined;
        this.blackSocket = blackSocket;
        this.redSocket = undefined;
        this.boardState = new Board();
        blackSocket.send("Created Game");
    }

    join(redID: string, redSocket: WebSocket) {
        if(this.redID !== undefined || this.redSocket !== undefined) {
            throw "join: redID or redSocket already exist!";
        }
        this.redID = redID;
        this.redSocket = redSocket;
        this.sendBoth("joined game");
    }

    private sendBoth(message: string) {
        if(this.redSocket === undefined) {
            throw "sendBoth: sending both when redSocket is undefined!";
        }
        this.blackSocket.send(message);
        this.redSocket.send(message);
    }

    private getSocketColor(socket: WebSocket): Color {
        if(socket === this.blackSocket) {
            return Color.BLACK;
        }
        if(socket === this.redSocket) {
            return Color.RED;
        }
        return Color.NO_COLOR;
    }

    private socketMessageFunction(socket: WebSocket, color: Color, message: string) {
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
            socket.send(
                JSON.stringify(
                    new JSONBoardStateResponse(this.boardState).toObject()));
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
        }
    }
}
