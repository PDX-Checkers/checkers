import { ActiveGameController } from 'src/controllers/ActiveGameController';
import { ActiveGame } from 'src/BoardClasses/ActiveGame';
import { __spreadArrays } from 'tslib';
import { Logger } from '@overnightjs/logger';

export abstract class JSONRequest {
    constructor() {}

    isStateRequest(): boolean {
        return false;
    }
    isMoveRequest(): boolean {
        return false;
    }
    isGetGamesRequest(): boolean {
        return false;
    }
    isCreateGameRequest(): boolean {
        return false;
    }
    isJoinGameRequest(): boolean {
        return false;
    }
    isSpectateGameRequest(): boolean {
        return false;
    }
    isLeaveGameRequest(): boolean {
        return false;
    }
    getMove(): [number, number] | null {
        return null;
    }
    getGameID(): string | null {
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

export class JSONGetGamesRequest extends JSONRequest {
    constructor() {
        super();
    }
    isGetGamesRequest(): boolean {
        return true;
    }
}

export class JSONCreateGameRequest extends JSONRequest {
    constructor() {
        super();
    }
    isCreateGameRequest(): boolean {
        return true;
    }
}

export class JSONJoinGameRequest extends JSONRequest {
    gameID: string;
    constructor(gameID: string) {
        super();
        this.gameID = gameID;
    }

    isJoinGameRequest(): boolean {
        return true;
    }

    getGameID(): string | null {
        return this.gameID;
    }
}

export class JSONSpectateGameRequest extends JSONRequest {
    gameID: string;
    constructor(gameID: string) {
        super();
        this.gameID = gameID;
    }

    isSpectateGameRequest(): boolean {
        return true;
    }

    getGameID(): string | null {
        return this.gameID;
    }
}

export class JSONLeaveGameRequest extends JSONRequest {
    constructor() {
        super();
    }
    isLeaveGameRequest(): boolean {
        return true;
    }
}

export function parseMessageJSON(json: string): JSONRequest | null {
    let parsedObj: any;
    try {
        parsedObj = JSON.parse(json);
    }
    catch(err) {
        Logger.Info(`Unable to parse message ${json} as JSON!`)
        return null;
    }
    // All parsedObjs must have a request_type property.
    if(parsedObj?.request_type === undefined) {
        return null;
    }
    if(parsedObj.request_type === "get_state") {
        return new JSONStateRequest();
    }
    if(parsedObj.request_type === "move") {
        if(Number.isInteger(parsedObj?.move?.source) &&
           Number.isInteger(parsedObj?.move?.target)) {
            return new JSONMoveRequest(parsedObj.move.source, parsedObj.move.target);
        }
    }
    if(parsedObj.request_type === "get_games") {
        return new JSONGetGamesRequest();
    }
    if(parsedObj.request_type === "create_game") {
        return new JSONCreateGameRequest();
    }
    if(parsedObj.request_type === "leave_game") {
        return new JSONLeaveGameRequest();
    }
    if(parsedObj.request_type === "join_game") {
        if(typeof parsedObj.gameID === "string") {
            return new JSONJoinGameRequest(parsedObj.gameID);
        }
        else {
            return null;
        }
    }
    if(parsedObj.request_type === "spectate_game") {
        if(typeof parsedObj.gameID === "string") {
            return new JSONSpectateGameRequest(parsedObj.gameID);
        }
        else {
            return null;
        }
    }
    return null;
}