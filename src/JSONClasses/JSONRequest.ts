export abstract class JSONRequest {
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

export function parseMessageJSON(json: string): JSONRequest | null {
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