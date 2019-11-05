import { Request, Response } from 'express';
import { Controller, Get } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as mariadb from "mariadb";


@Controller('api/game')
export class GameController {

  private queryUsers(): Promise<object> {
    const pool = mariadb.createPool({
      user: "blarg",
      password: "blarg",
      database: "checkers",
      connectionLimit: 5
    });
    return pool.getConnection()
               .then(conn => 
                conn.query("SELECT * FROM users"))
               .then()
               .catch(err => err);
  }

  @Get()
  private getGameState(req: Request, res: Response) {
    Logger.Info(req.params.msg);
    this.queryUsers()
        .then(result => 
          res.status(200).json({
            message: result
          }));
  }
}
