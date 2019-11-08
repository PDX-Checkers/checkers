import { Board, Color } from "./Board"
import * as ws from "ws";

abstract class JSONRequest {
    constructor() {}

    isStateRequest(): boolean {
        return false;
    }
    isMoveRequest(): boolean {
        return false;
    }
    getMove(): [number, number] | null {
        return null;
    }
}

class JSONStateRequest extends JSONRequest {
    constructor() { super(); }
    isStateRequest(): boolean {
        return true;
    }
}

class JSONMoveRequest extends JSONRequest {
    source: number;
    target: number;

    constructor(source: number, target: number) { 
        super();
        this.source = source;
        this.target = target;
    }

    isMoveRequest(): boolean {
        return true;
    }

    getMove(): [number, number] | null {
        return [this.source, this.target];
    }
}

abstract class JSONResponse {
    constructor() {}

    isInvalidMessage(): boolean {
        return false;
    }

    isInvalidMove(): boolean {
        return false;
    }

    isBoardState(): boolean {
        return false;
    }

    isValidMove(): boolean {
        return false;
    }

    isNotYourTurn(): boolean {
        return false;
    }

    abstract toObject(): object;
}

class JSONInvalidMessageResponse extends JSONResponse {
    message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    isInvalidMessage(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "invalid_message",
            message: this.message
        };
    }
}

class JSONInvalidMoveResponse extends JSONResponse {
    constructor() {
        super();
    }

    isInvalidMove(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "invalid_move"
        }
    }
}

class JSONBoardStateResponse extends JSONResponse {
    board: Board;

    constructor(board: Board) {
        super();
        this.board = board.copy();
    }

    isBoardState(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "board_state",
            board_state: this.board.toObject()
        };
    }
}

class JSONValidMoveResponse extends JSONResponse {
    board: Board;

    constructor(board: Board) {
        super();
        this.board = board.copy();
    }

    isValidMove(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "valid_move",
            board_state: this.board.toObject()
        };
    }
}

class JSONIsNotYourTurnResponse extends JSONResponse {
    constructor() { super(); }

    isNotYourTurn(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "not_your_turn"
        };
    }
}

function parseMessageJSON(json: string): JSONRequest | null {
    let parsedObj: any = JSON.parse(json);
    if(parsedObj?.request_type && parsedObj.request_type === "get_state") {
        return new JSONStateRequest();
    }
    if(parsedObj?.request_type && parsedObj.request_type === "move") {
        if(Number.isInteger(parsedObj?.move?.source) &&
           Number.isInteger(parsedObj?.move?.target)) {
            return new JSONMoveRequest(parsedObj.move.source, parsedObj.move.target);
        }
    }
    return null;
}

class BoardState {
    blackID: number;
    redID?: number;
    blackSocket: WebSocket;
    redSocket?: WebSocket;
    boardState: Board;

    // The Black player creates the game. The Red player joins the game.
    constructor(blackID: number, blackSocket: WebSocket) {
        this.blackID = blackID;
        this.redID = undefined;
        this.blackSocket = blackSocket;
        this.redSocket = undefined;
        this.boardState = new Board();
        blackSocket.send("Created Game");
    }

    join(redID: number, redSocket: WebSocket) {
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
