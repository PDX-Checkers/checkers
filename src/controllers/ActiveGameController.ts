import { Logger } from '@overnightjs/logger';
import { ActiveGame } from '../BoardClasses/ActiveGame';
import { JSONActiveGames, 
         JSONInvalidMessageResponse, 
         sendResponse } from '../JSONClasses/JSONResponse';
import { DbManager } from '../DbManager'
import { Router, Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import OOPEventWebSocket = require('ws');
import { JSONRequest, parseMessageJSON } from '../JSONClasses/JSONRequest';

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

    processMessage(ws: OOPEventWebSocket, username: string, msg: string) {
        let msgObj: JSONRequest | null = parseMessageJSON(msg);
        if(msgObj === null) {
            Logger.Info(`Got malformed request from ${username}`);
            sendResponse(ws, new JSONInvalidMessageResponse("Request was malformed"));
            return;
        }
        if(msgObj.isGetGamesRequest()) {
            Logger.Info(`Giving games to ${username}`);
            sendResponse(ws, new JSONActiveGames(this));
            return;
        }
        if(msgObj.isCreateGameRequest()) {
            Logger.Info(`Creating game for ${username}`);
            this.createGame(username, ws);
            return;
        }
        if(msgObj.isJoinGameRequest()) {
            let gameID: string | null = msgObj.getGameID();
            if(gameID === null) {
                Logger.Err("processMessage JoinGameRequest: Something went extremely wrong, gameID is null");
                return;
            }
            Logger.Info(`${username} is trying to join ${gameID}`);
            this.joinGame(gameID, username, ws);
            return;
        }
        Logger.Info(`${username} sent a valid request, but it's not for the ActiveGameController.`);
        sendResponse(ws, new JSONInvalidMessageResponse("Request was valid, but in the wrong scope"));
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
