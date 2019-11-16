import { Logger } from '@overnightjs/logger';
import { ActiveGame } from '../BoardClasses/ActiveGame';
import { JSONActiveGames } from '../JSONClasses/JSONResponse';
import { DbManager } from '../DbManager'
import { Router, Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import OOPEventWebSocket = require('ws');

// This Controller contains a data structure of games in progress. Each
// ActiveGame object will contain two websockets, and thus a lot of the
// logic in this class consists of constructing objects, copying
// websocket references around, and subscribing them to things.
// Note that the ActiveGame class also deals a lot with websockets.

export class ActiveGameController {
    games: Map<string, ActiveGame>;
    private userSockets: Map<string, OOPEventWebSocket>;
    // Convenience variable to take advantage of variable capture in closures.
    // `this` is ambiguous inside closures, while `self` is not. 
    // If the word "hate" was engraved on each nanoangstrom of these hundreds of
    // millions of miles of circuitry, it would not equal one one-billionth of the
    // hate I feel for Javascript at this microinstant. Hate. Hate.
    private self: ActiveGameController;

    getRoutes(): Router {
        let router = Router();
        router.ws('/', wsSubscriber(this.self));
        return router;
    }

    constructor() {
        this.games = new Map<string, ActiveGame>();
        this.userSockets = new Map<string, OOPEventWebSocket>();
        this.self = this;
    }

    public createGame(playerID: string, ws: OOPEventWebSocket) {
        let key: string | undefined = undefined;
        while(key === undefined || this.games.has(key)) {
            key = createGameID();
        }
        this.games.set(key, new ActiveGame(this, playerID, ws));
    }

    public joinGame(gameID: string, playerID: string, ws: OOPEventWebSocket) {
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
    processMessage(ws: OOPEventWebSocket, username: string, msg: string) {
        let msgObj: any = JSON.parse(msg)
        switch(msgObj["request_type"]) {
            case "get": {
                Logger.Info(`Giving games to ${username}`);
                ws.send(JSON.stringify(new JSONActiveGames(this).toObject()));
                break;
            }
            case "create": {
                Logger.Info(`Creating game for ${username}`);
                this.createGame(username, ws);
                break;
            }
            case "join" : {
                let gameID: any = msgObj["game_id"];
                Logger.Info(`${username} is trying to join ${gameID}`);
                this.joinGame(gameID, username, ws);
                break;
            }
            default: {
                Logger.Info(`${username} is sending gibberish`)
                ws.send("???");
            }
        }
    }

    public getUserSocket(username: string): OOPEventWebSocket | undefined {
        return this.userSockets.get(username);
    }

    public addUserSocket(username: string, ws: OOPEventWebSocket): void {
        this.userSockets.set(username, ws);
    }

    public removeUserSocket(username: string): void {
        this.userSockets.delete(username);
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

function wsSubscriber(controller: ActiveGameController): ((ws: OOPEventWebSocket, req: Request<ParamsDictionary>) => void) {
    return function(ws, req) {
        if(req.isAuthenticated()) {
            let userObj: any = <any>req.user;
            let username: any = userObj["username"];
            if(username === undefined || typeof username !== "string") {
                throw `wsSubscriber: username ${username} is somehow invalid`
            }
            Logger.Info(`Received websocket connection from ${username}`);
            if(controller.getUserSocket(<string>username)) {
                Logger.Info(`But it's a duplicate...`);
                ws.send("You already connected!");
                ws.close();
            }
            // Happy path - subscribes the websocket to the Listener.
            else {
                controller.addUserSocket(username, ws);
                subscribe(controller, ws, username);
            }
        }
        else {
            Logger.Info("Received unauthorized websocket request.");
            ws.send("You aren't authenticated, fool!");
            ws.close();
        }
    }
}

export function subscribe(controller: ActiveGameController, ws: OOPEventWebSocket, username: string) {
    ws.removeAllListeners();
    ws.on('message', wsListener(controller, ws, username));
    ws.on('close', wsCloser(controller, username));
}

function wsListener(controller: ActiveGameController, ws: OOPEventWebSocket, username: string): ((s: string) => void) {
    return function(s: string) { controller.processMessage(ws, username, s) };
}

function wsCloser(controller: ActiveGameController, username: string):
    (() => void) {
    return function() { 
        Logger.Info(`Closing connection with ${username}`);
        controller.removeUserSocket(username);
    };
}
