import { DbManager } from '../DbManager'
import { User } from '../models/User';

export class DbHelpers {
  static async getUser(username: string) {
    const query = `SELECT * from users WHERE username = '${username}'`;
    const results = await DbManager.doQuery(query);
    if (results.length === 0) {
      return null;
    }
    const user = results[0];
    return new User(user.username, user.password);
  }

  static async createUser(username: string, password: string) {
    const query =
    `INSERT INTO users (username, password) values ('${username}', '${password}')`;
    return await DbManager.doQuery(query);
  }
}