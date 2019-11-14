import * as express from 'express'
import * as controllers from './controllers';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { DbManager } from './DbManager'
import * as uuid from 'node-uuid'
import * as session from 'express-session'
import * as passport from 'passport'
import { Strategy } from 'passport-local'
import { DbHelpers } from './helpers/DbHelpers';
import { User } from './models/User';
import * as bcrypt from 'bcrypt';
import * as cors from 'cors';
import * as expressWs from 'express-ws';
import * as path from 'path';
import { ActiveGameController } from './controllers/ActiveGameController';
/* tslint:disable-next-line */
const FileStore = require('session-file-store')(session);

class CheckersServer extends Server {

  private totallyNotSecret: string;
  private wsInstance: expressWs.Instance;

  constructor() {
    super(true);

    // MODIFIES THE EXPRESS APPLICATION!
    // This function adds Websocket capabilities to our Express app.
    // In addition, this.wsInstance is our interface for accessing the
    // websocket server with this.wsInstance.getWss().
    // Having this member is necessary if we want to do things like send
    // a message to every websocket.
    this.wsInstance = expressWs(this.app);

    this.totallyNotSecret = 'I am smell blind';
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

    // Unfortunately, the websockets controller is not playing nicely here.
    // Because we can't use the Overnight decorators, we have to treat this one
    // separately and do it the old-fashioned Express way.
    let AGController = new ActiveGameController();
    this.app.use('/api/ws', AGController.getRoutes());
  }

  public async start(port: number): Promise<any> {
    // Don't know how useful this is exactly, but having CORS setup will
    // theoretically make local requests easier
    this.app.use(cors());

    // Initialize DB pool
    const manager = new DbManager();
    await manager.initialize();

    // Initialize per-user authentication
    passport.use(new Strategy(
      async (username, password, done) => {
        const user = await DbHelpers.getUser(username);
        if (user === null) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!bcrypt.compare(password, user.getPassword())) {
          return done(null, false, { message: 'Incorrect Password.' });
        }
        return done(null, user)
      }
    ))

    passport.serializeUser((user: User, done) => {
      done(null, user.getUsername());
    });

    passport.deserializeUser(async (username: string, done) => {
      const user = await DbHelpers.getUser(username);
      done(null, user);
    });

    // Set up JSON parsing 
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));

    // Set up per-user sessions IDs (enables authentication between page visits)
    this.app.use(session({
      genid: () => {
        return uuid.v4();
      },
      secret: this.totallyNotSecret,
      resave: false,
      saveUninitialized: true,
      store: new FileStore()
    }));

    // Starts up authentication and lets passport know about sessions
    this.app.use(passport.initialize());
    this.app.use(passport.session())

    // Set up endpoints
    this.setupControllers();

    // Set up default page based on dev or prod
    if (process.env.NODE_ENV === 'production') {
      const dir = path.join(__dirname, 'public/checkers-client/');
      this.app.set('views', dir);
      this.app.use(express.static(dir));
      this.app.get('*', (req, res) => {
        res.sendFile('index.html', {root: dir});
      });
    } else {
      this.app.get('*', (req, res) => res.send('Server\'s up. Port: ' + port));
    }


    // Server actually starts listening for requests
    this.app.listen(port, () => {
      Logger.Info('Server\'s up. Port: ' + port);
    })
  }
}

export default CheckersServer;