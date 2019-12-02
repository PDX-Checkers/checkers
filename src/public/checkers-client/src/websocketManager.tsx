export class WebsocketManager {
  // I'd like to give this type WebSocket, but that doesn't play nicely
  // unless I make it on the constructor
  private static ws: any;

  public static connect() {
    const loc = window.location;
    let newUri = 'ws:';
    newUri += '//' + loc.host;
    newUri += loc.pathname + 'api/ws';
    (WebsocketManager.ws as WebSocket) = new WebSocket(newUri);
  }

  public static disconnect() {
    (WebsocketManager.ws as WebSocket).close();
  }

  public static setOnMessage(callback: (arg: any) => void) {
    (WebsocketManager.ws as WebSocket).onmessage = callback;
  }

  public static setOnClose(callback: (arg: any) => void) {
    (WebsocketManager.ws as WebSocket).onclose = callback;
  }

  public static isWsConnected(): boolean {
    if (WebsocketManager.ws !== undefined &&
      (WebsocketManager.ws as WebSocket).readyState === WebSocket.OPEN) {
      return true;
    }
    return false;
  }

  public static sendMessage(message: any){
    WebsocketManager.waitForSocketConnection(WebsocketManager.ws, () => {
        (WebsocketManager.ws as WebSocket).send(JSON.stringify(message));
    });
  }

  private static waitForSocketConnection(socket: WebSocket, callback: () => void){
    setTimeout(
        () => {
            if (socket.readyState === WebSocket.OPEN) {
                if (callback != null){
                    callback();
                }
            } else {
                WebsocketManager.waitForSocketConnection(socket, callback);
            }

        }, 5); // wait 5 milisecond for the connection
  }
}