import { Board } from '../BoardClasses/Board';
import { ActiveGame } from '../BoardClasses/ActiveGame';
import { ActiveGameController } from '../controllers/ActiveGameController';
import OOPEventWebSocket = require('ws');

export abstract class JSONResponse {
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

    toJSON(): string {
        return JSON.stringify(this.toObject());
    }
}

export class JSONInvalidMessageResponse extends JSONResponse {
    message: string;
    board_state ?: Board;

    constructor(message: string, board_state?: Board) {
        super();
        this.message = message;
        this.board_state = board_state;
    }

    isInvalidMessage(): boolean {
        return true;
    }

    toObject(): object {
        let obj: any = {};
        obj.response_type = "invalid_message";
        if(this.board_state !== undefined) {
            obj.board_state = this.board_state.toObject();
        }
        return obj;
    }
}

export class JSONVeryBadResponse extends JSONResponse {
    message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    toObject(): object {
        return {
            response_type: "very_bad_response",
            message: this.message
        };
    }
}

export class JSONInvalidMoveResponse extends JSONResponse {
    private board: Board;
    constructor(board: Board) {
        super();
        this.board = board;
    }

    isInvalidMove(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "invalid_move",
            board_state: this.board.toObject()
        };
    }
}

export class JSONGameStateResponse extends JSONResponse {
    redID?: string;
    blackID: string;
    boardState: Board;

    constructor(game: ActiveGame) {
        super();
        this.redID = game.redID;
        this.blackID = game.blackID;
        this.boardState = game.boardState.copy();
    }

    isBoardState(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "board_state",
            red_id: this.redID,
            black_id: this.blackID,
            board_state: this.boardState.toObject()
        };
    }
}

export class JSONValidMoveResponse extends JSONResponse {
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

export class JSONIsNotYourTurnResponse extends JSONResponse {
    private board: Board;
    constructor(board: Board) { 
        super(); 
        this.board = board;
    }

    isNotYourTurn(): boolean {
        return true;
    }

    toObject(): object {
        return {
            response_type: "not_your_turn",
            board_state: this.board.toObject()
        };
    }
}

export class JSONActiveGames extends JSONResponse {
    games: Map<string, ActiveGame>;
    constructor(controller: ActiveGameController) {
        super();
        this.games = controller.games;
    }
    toObject(): object {
        return {
            response_type: "active_games",
            games: Array.from(this.games.entries()).map(([x, y]) => [x, y.toObject()])
        };
    }
}

export class JSONCreatedGame extends JSONResponse {
    private board: Board;
    constructor(board: Board) {
        super();
        this.board = board;
    }
    toObject(): object {
        return {
            response_type: "created_game",
            board_state: this.board.toObject()
        };
    }
}

export class JSONJoinedGame extends JSONResponse {
    private board: Board;
    constructor(board: Board) {
        super();
        this.board = board;
    }
    toObject(): object {
        return {
            response_type: "joined_game",
            board_state: this.board.toObject()
        };
    }
}

export class JSONSpectatedGame extends JSONResponse {
    private board: Board;
    constructor(board: Board) {
        super();
        this.board = board;
    }
    toObject(): object {
        return {
            response_type: "spectated_game",
            board_state: this.board.toObject()
        };
    }
}

export class JSONCouldntFindGame extends JSONResponse {
    gameID: string;
    constructor(gameID: string) {
        super();
        this.gameID = gameID;
    }

    toObject(): object {
        return {
            response_type: "couldnt_find_game",
            game_id: this.gameID
        };
    }
}

export class JSONJoinedRoom extends JSONResponse {
    constructor() {
        super();
    }
    toObject(): object {
        return {
            response_type: "joined_room"
        };
    }
}

export function sendResponse(ws: OOPEventWebSocket, response: JSONResponse) {
    ws.send(response.toJSON());
}