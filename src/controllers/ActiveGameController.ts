import { Logger } from '@overnightjs/logger';
import { ActiveGame } from '../BoardClasses/ActiveGame';
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
    private games: Map<string, ActiveGame>;
    private userSockets: Map<string, OOPEventWebSocket>;

    getRoutes(): Router {
        let router = Router();
        let thisArg: ActiveGameController = this;
        router.ws('/', wsSubscriber(thisArg));
        return router;
    }

    constructor() {
        this.games = new Map<string, ActiveGame>();
        this.userSockets = new Map<string, OOPEventWebSocket>();
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
    processMessage(ws: OOPEventWebSocket, msg: string) {
        console.log("ayylmao");
        ws.send(`I got your message: ${msg}`);
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
                ws.on('message', wsListener(controller, ws));
                ws.on('close', wsCloser(controller, username));
                controller.addUserSocket(username, ws);
            }
        }
        else {
            Logger.Info("Received unauthorized websocket request.");
            ws.send("You aren't authenticated, fool!");
            ws.close();
        }
    }
}

function wsListener(controller: ActiveGameController, ws: OOPEventWebSocket): ((s: string) => void) {
    return function(s: string) { controller.processMessage(ws, s) };
}

function wsCloser(controller: ActiveGameController, username: string):
    (() => void) {
    return function() { 
        Logger.Info(`Closing connection with ${username}`);
        controller.removeUserSocket(username);
    };
}
