import { Controller, Get } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { DbManager } from '../DbManager'


@Controller('api/game')
export class GameController {

  private async queryUsers() {
    const query = 'SELECT * FROM users';
    return await DbManager.doQuery(query);
  }

  @Get()
  private async getGameState(req: Request, res: Response) {
    Logger.Info(req.params.msg);
    const result = await this.queryUsers()
    res.status(200).json({message: result});
  }
}
