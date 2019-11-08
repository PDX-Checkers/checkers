import { Controller, Get, Post } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';

@Controller('api/game')
export class GameController {

  @Post()
  private async createNewGame(req: Request, res: Response) {
    // isAuthenticated verifies the user is logged in
    if (req.isAuthenticated()) {

    }
    // Do create active game stuff here
    res.status(200).json({message: 'result'});
  }

  @Get()
  private async getGames(req: Request, res: Response) {
    if (req.isAuthenticated()) {

    }
    res.status(200).json({message: 'result'});
  }

  @Post(':id') 
  private async joinGame(req: Request, res: Response) {
    if (req.isAuthenticated()) {

    }
    res.status(200).json({message: 'result'});
  }

}
