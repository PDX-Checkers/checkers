export class User {
  private username: string;
  private password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  public getUsername() {
    return this.username;
  }

  public getPassword() {
    return this.password;
  }
}