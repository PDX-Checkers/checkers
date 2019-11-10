import { ActiveGame } from '../BoardClasses/ActiveGame';
import * as express from 'express';

// This Controller contains a data structure of games in progress. Each
// ActiveGame object will contain two websockets, and thus a lot of the
// logic in this class consists of constructing objects, copying
// websocket references around, and subscribing them to things.
// Note that the ActiveGame class also deals a lot with websockets.

export class ActiveGameController {
    private games: Map<string, ActiveGame>;

    getRoutes(): express.Router {
        let router = express.Router();
        let thisArg: ActiveGameController = this;
        router.ws('/', function(ws, req) {
            // lol typecasting to avoid this issue:
            // https://github.com/websockets/ws/issues/1583
            ws.on('message', wsListener(thisArg, <WebSocket><unknown>ws));
        });
        return router;
    }

    constructor() {
        this.games = new Map<string, ActiveGame>();
    }

    public createGame(playerID: string, ws: WebSocket) {
        let key: string | undefined = undefined;
        while(key === undefined || this.games.has(key)) {
            key = createGameID();
        }
        this.games.set(key, new ActiveGame(playerID, ws));
    }

    public joinGame(gameID: string, playerID: string, ws: WebSocket) {
        let g: ActiveGame | undefined = this.games.get(gameID);
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

    // For now, this just echoes a message. In the future, this will be used to
    // process creating games and joining them.
    processMessage(ws: WebSocket, msg: string) {
        console.log("ayylmao");
        ws.send(`I got your message: ${msg}`);
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

function wsListener(controller: ActiveGameController, ws: WebSocket): ((s: string) => void) {
    return function(s: string) { controller.processMessage(ws, s) };
}