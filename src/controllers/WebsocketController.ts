import { ActiveGameController } from '../BoardClasses/ActiveGameController';
import * as express from 'express';
import * as ws from 'ws';

export class WebsocketController {
    private gameController: ActiveGameController;
    getRoutes(): express.Router {
        let router = express.Router();
        let thisArg: WebsocketController = this;
        router.ws('/', function(ws, req) {
            // lol typecasting to avoid this issue:
            // https://github.com/websockets/ws/issues/1583
            ws.on('message', wsListener(thisArg, <WebSocket><unknown>ws));
        });
        return router;
    }

    constructor() {
        this.gameController = new ActiveGameController();
    }

    processMessage(ws: WebSocket, msg: string) {
        console.log("ayylmao");
        ws.send(`I got your message: ${msg}`);
    }
}

function wsListener(controller: WebsocketController, ws: WebSocket): ((s: string) => void) {
    return function(s: string) { controller.processMessage(ws, s) };
}