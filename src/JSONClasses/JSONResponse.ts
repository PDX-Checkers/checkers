import { Board } from '../BoardClasses/Board'
import { ActiveGame } from 'src/BoardClasses/ActiveGame';

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

export class JSONInvalidMoveResponse extends JSONResponse {
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

export class JSONGameStateResponse extends JSONResponse {
    redID: string;
    blackID: string;
    boardState: Board;

    constructor(game: ActiveGame) {
        super();
        let obj: any = game.toObject();
        this.redID = obj.redID;
        this.blackID = obj.blackID;
        this.boardState = obj.boardState.copy();
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