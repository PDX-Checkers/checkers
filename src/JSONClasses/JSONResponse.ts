import { Board } from '../BoardClasses/Board'

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

export class JSONBoardStateResponse extends JSONResponse {
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