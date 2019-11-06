import { Controller, Get } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { DbManager } from '../DbManager'


@Controller('api/game')
export class GameController {

  private queryUsers(): Promise<object> {
    return DbManager.pool.getConnection()
               .then(conn => conn.query('SELECT * FROM users'))
               .catch(err => err);
  }

  @Get()
  private getGameState(req: Request, res: Response) {
    Logger.Info(req.params.msg);
    this.queryUsers()
        .then(result => res.status(200).json({
            message: result
          }));
  }
}
