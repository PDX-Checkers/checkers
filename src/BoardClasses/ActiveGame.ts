import { Board, Color } from "./Board";
import { JSONRequest, parseMessageJSON } from '../JSONClasses/JSONRequest';
import { JSONInvalidMessageResponse, 
         JSONGameStateResponse,
         JSONIsNotYourTurnResponse,
         JSONInvalidMoveResponse,
         JSONValidMoveResponse, 
         JSONResponse,
         JSONJoinedGame,
         JSONCreatedGame,
         sendResponse,
         JSONVeryBadResponse} from '../JSONClasses/JSONResponse';
import OOPEventWebSocket = require('ws');
import { ActiveGameController, subscribe } from '../controllers/ActiveGameController';
import { Logger } from '@overnightjs/logger';

export class ActiveGame {
    blackID: string;
    redID?: string;
    blackSocket: OOPEventWebSocket;
    redSocket?: OOPEventWebSocket;
    boardState: Board;
    gameID: string;
    parent: ActiveGameController;
    spectators: Map<string, OOPEventWebSocket>;

    // The Black player creates the game. The Red player joins the game.
    constructor(parent: ActiveGameController, gameID: string, blackID: string, blackSocket: OOPEventWebSocket, redID?: string, redSocket?: OOPEventWebSocket, board?: Board) {
        this.parent = parent;
        this.spectators = new Map<string, OOPEventWebSocket>();
        this.gameID = gameID;
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
        sendResponse(this.blackSocket, new JSONCreatedGame(this.boardState));
        this.subscribe(blackSocket, Color.BLACK);
    }

    join(redID: string, redSocket: OOPEventWebSocket) {
        if(this.redID !== undefined || this.redSocket !== undefined) {
            throw "join: redID or redSocket already exist!";
        }
        this.redID = redID;
        this.redSocket = redSocket;
        this.subscribe(redSocket, Color.RED);
        this.sendBoth(new JSONJoinedGame(this.boardState));
    }

    private sendBoth(message: JSONResponse) {
        if(this.redSocket === undefined) {
            throw "sendBoth: sending both when redSocket is undefined!";
        }
        sendResponse(this.blackSocket, message);
        sendResponse(this.redSocket, message);
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
            sendResponse(socket, new JSONInvalidMessageResponse("Invalid object", this.boardState));
            return;
        }
        if(parsedObj.isStateRequest()) {
            sendResponse(socket, new JSONGameStateResponse(this));
            return;
        }
        // If it's not invalid and it's not a state request, it's a move request.
        else {
            if(this.getSocketColor(socket) !== this.boardState.getCurrentState().color) {
                sendResponse(socket, new JSONIsNotYourTurnResponse(this.boardState));
                return;
            }
            let move: [number, number] | null = parsedObj.getMove();
            if(move === null) {
                sendResponse(socket, new JSONVeryBadResponse("Move is null???"));
                return;
            }
            let [source, target]: [number, number] = move;
            let newBoard: Board | null = this.boardState.move(source, target);
            if(newBoard === null) {
                sendResponse(socket, new JSONInvalidMoveResponse(this.boardState));
                return;
            }

            this.boardState = newBoard;
            this.sendBoth(new JSONValidMoveResponse(this.boardState));

            if(this.boardState.isCompleteGame()) {
                this.finishGame();
            }
        }
    }

    public processSpectatorMessage(ws: OOPEventWebSocket, gameID: string, message: string) {
        let parsedObj: JSONRequest | null = parseMessageJSON(message);
        if(parsedObj === null) {
            sendResponse(ws, new JSONInvalidMessageResponse("Invalid object", this.boardState));
            return;
        }
        if(parsedObj.isStateRequest()) {
            sendResponse(ws, new JSONGameStateResponse(this));
            return;
        }
        if(parsedObj.isLeaveGameRequest()) {
            subscribe(this.parent, ws, gameID);
        }
        else {
            sendResponse(ws, new JSONInvalidMessageResponse("Valid request, but unauthorized"));
            return;
        }
    }

    subscribe(ws: OOPEventWebSocket, color: Color) {
        let thisArg: ActiveGame = this;
        ws.removeAllListeners();
        ws.on("message", wsListener(thisArg, ws, color));
        ws.on("close", finishGameEarlyListener(thisArg, color));
    }

    subscribeSpectator(ws: OOPEventWebSocket, gameID: string) {
        let thisArg: ActiveGame = this;
        this.spectators.set(gameID, ws);
        ws.removeAllListeners();
        ws.on("message", wsSpectatorListener(thisArg, ws, gameID));
        ws.on("close", leaveEarlySpectatorListener(thisArg, gameID));
    }

    // Once we finish the game, we need to return both websockets to the control of the ActiveGame.
    finishGame() {
        Logger.Info(`Finished Game: ${this.toObject()}`);
        if(isOpen(this.blackSocket)) {
            subscribe(this.parent, this.blackSocket, this.blackID);
        }
        else {
            this.parent.removeUserSocket(this.blackID);
        }
        if(this.redSocket !== undefined && this.redID !== undefined && isOpen(this.redSocket)) {
            subscribe(this.parent, this.redSocket, this.redID);
        }
        this.spectators.forEach((ws, gameID) => subscribe(this.parent, ws, gameID));
        this.parent.removeGame(this.gameID);
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

function leaveEarlySpectatorListener(game: ActiveGame, gameID: string): (() => void) {
    return function() {
        let ws: OOPEventWebSocket | undefined = game.spectators.get(gameID);
        if(ws !== undefined && isOpen(ws)) {
            subscribe(game.parent, ws, gameID);
        }
    }
}
    
function wsListener(game: ActiveGame, ws: OOPEventWebSocket, color: Color): ((s: string) => void) {
    return function(s: string) { game.processMessage(ws, color, s) };
}

function wsSpectatorListener(game: ActiveGame, ws: OOPEventWebSocket, gameID: string): ((s: string) => void) {
    return function(s: string) { game.processSpectatorMessage(ws, s, gameID)};
}

function isOpen(socket: OOPEventWebSocket) {
    return socket.readyState === 1;
}
