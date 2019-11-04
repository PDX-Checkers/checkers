import * as express from 'express'
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

class CheckersServer extends Server {
  
  constructor() {
    super(true);
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.setupControllers();
  } 

  private setupControllers(): void {
    const ctlrInstances = [];
    debugger;
    for (const name in controllers) {
        if (controllers.hasOwnProperty(name)) {
            const controller = (controllers as any)[name];
            ctlrInstances.push(new controller());
        }
    }
    super.addControllers(ctlrInstances);
}

  public start(port: number): void {
    this.app.get('*', (req, res) => {
      res.send('Server\'s up. Port: ' + port);
  });
    this.app.listen(port, () => {
      Logger.Info('Server\'s up. Port: ' + port);
    })
  }
}

export default CheckersServer;