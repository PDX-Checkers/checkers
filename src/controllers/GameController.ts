import { Request, Response } from 'express';
import { Controller, Get } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';


@Controller('api/game')
export class GameController {

  @Get()
  private getGameState(req: Request, res: Response) {
    Logger.Info(req.params.msg);
    res.status(200).json({
      message: 'Beans'
    })
  }
}
