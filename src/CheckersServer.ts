import * as express from 'express'
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { DbManager } from './DbManager'

class CheckersServer extends Server {

  constructor() {
    super(true);
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.setupControllers();
  }

  private setupControllers(): void {
    const ctlrInstances = [];
    for (const name in controllers) {
        if (controllers.hasOwnProperty(name)) {
            const controller = (controllers as any)[name];
            ctlrInstances.push(new controller());
        }
    }
    super.addControllers(ctlrInstances);
}

  public async start(port: number): Promise<any> {
    const manager = new DbManager();
    await manager.initialize();

    this.app.use(express.static(__dirname));
    this.app.get('/', (req, res) => {
      res.send('/index.html')
    });
    this.app.listen(port, () => {
      Logger.Info('Server\'s up. Port: ' + port);
    })
  }
}

export default CheckersServer;