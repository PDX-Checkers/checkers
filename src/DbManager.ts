import * as mariadb from 'mariadb';
import * as fs from 'fs';
import * as os from 'os';

export class DbManager {
  static pool: mariadb.Pool;

  public initialize() {
    const configPath = os.homedir() + '/.config/dbConfig.json';
    const rawConfig = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(rawConfig);

    DbManager.pool = mariadb.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      connectionLimit: 10,
      database: 'checkers'
    });
  }
}