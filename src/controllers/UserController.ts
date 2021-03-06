import { Controller, Get, Post, Middleware, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { DbManager } from '../DbManager'
import { allItemsHaveValues } from '../helpers/ControllerHelpers'
import passport = require('passport');
import { DbHelpers } from '../helpers/DbHelpers';
import * as bcrypt from 'bcrypt'
import { saltRounds } from '../helpers/HashHelpers';

@Controller('api/users')
export class UserController {

  @Get()
  // For debugging
  private async getUsers(req: Request, res: Response) {
    const query = `SELECT * FROM users`;
    const results = await DbManager.doQuery(query);
    res.status(200);
    res.json({message: results})
  }

  @Post()
  private async registerUser(req: Request, res: Response) {
    let user;
    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, saltRounds);
    if (!allItemsHaveValues([username, password])) {
      res.status(400).json({message: 'Username and Password must have values'});
    }
    user = await DbHelpers.getUser(username);
    if (user !== null) {
      Logger.Info('Username already taken');
      res.status(400).json({message: 'Username already taken'});
    } else {
      // Do something with result?
      const result = await DbHelpers.createUser(username, password);

      Logger.Info(`User: ${username} created`);
      res.status(200).json({message: 'Account created!'});
    }
  }

  @Post('login')
  @Middleware(passport.authenticate('local'))
  private async login(req: Request, res: Response) {
    res.status(200).json({message: 'Login Successful'});
  }

  @Post('logout')
  private async logout(req: Request, res: Response) {
    if (req.isAuthenticated()) {
      req.logout();
      res.status(200).json({message: 'Logged out'});
    } else {
      res.status(400).json({message: 'You are not logged in'});
    }
  }

  // Tests that you're logged in
  @Get('test')
  private async doStuff(req: Request, res: Response) {
    if(req.isAuthenticated()) {
      res.status(200).json({message: 'Logged in'})
    } else {
      res.status(400).json({message: 'Not'})
    }
  }
}
