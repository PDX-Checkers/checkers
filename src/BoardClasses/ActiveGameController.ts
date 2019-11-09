import * as ag from './ActiveGame';

export class ActiveGameController {
    private games: Map<string, ag.ActiveGame>;

    constructor() {
        this.games = new Map<string, ag.ActiveGame>();
    }

    public createGame(playerID: string, ws: WebSocket) {
        let key: string | undefined = undefined;
        while(key === undefined || this.games.has(key)) {
            key = createGameID();
        }
        this.games.set(key, new ag.ActiveGame(playerID, ws));
    }

    public joinGame(gameID: string, playerID: string, ws: WebSocket) {
        let g: ag.ActiveGame | undefined = this.games.get(gameID);
        if(g !== undefined) {
            g.join(playerID, ws);
        }
        else {
            ws.send("Unable to find game");
        }
    }

    public getGameIDs(): string[] {
        return Array.from(this.games.keys());
    }
}

const characterArray: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

function randomChoice<T>(lst: T[]): T {
    return lst[Math.floor(Math.random() * lst.length)];
}

function createGameID(): string {
    // 52^15 should be enough to avoid collisions, right?
    return new Array(15).fill(undefined)
                        .map(_ => randomChoice(characterArray))
                        .join("");
}