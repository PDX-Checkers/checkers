import * as mariadb from 'mariadb';
import * as fs from 'fs';
import * as os from 'os';

export class DbManager {
  static pool: mariadb.Pool;

  public async initialize() {
    const configPath = os.homedir() + '/.config/dbConfig.json';
    const rawConfig = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(rawConfig);

    await this.maybeCreateDb(config);
    this.createPool(config);
    await this.createTables();
  }

  private async maybeCreateDb(config: any) {
    let conn;

    try {
      conn = await mariadb.createConnection({
        host: config.host,
        user: config.user,
        password: config.password
      });
      await conn.query(`CREATE DATABASE IF NOT EXISTS checkers`);
    } catch(err) {
      throw err;
    } finally {
      if (conn) {
        await conn.end();
      }
    }
  }

  private createPool(config: any) {
    DbManager.pool = mariadb.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      connectionLimit: 10,
      database: 'checkers'
    });
  }

  private async createTables() {
    const createUserTable = `CREATE TABLE IF NOT EXISTS users (
      username VARCHAR(50) PRIMARY KEY,
      password TEXT,
      profile TEXT
    )`;
    await DbManager.doQuery(createUserTable);

    const createGameTable = `CREATE TABLE IF NOT EXISTS games (
      id VARCHAR(36) PRIMARY KEY,
      red_player VARCHAR(50),
      black_player VARCHAR(50),
      result LONGTEXT,
      CONSTRAINT FOREIGN KEY (red_player) REFERENCES users(username) ON DELETE CASCADE,
      CONSTRAINT FOREIGN KEY (black_player) REFERENCES users(username) ON DELETE CASCADE
    )`
    await DbManager.doQuery(createGameTable);
  }

  static async doQuery(queryToDo: string) {
    if (!DbManager.pool) {
      throw new Error('The connection pool is not initialized');
    }

    let conn: any;
    try {
      conn = await DbManager.pool.getConnection();
      return await conn.query(queryToDo);
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}