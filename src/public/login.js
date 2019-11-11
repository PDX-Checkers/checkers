

function doRegister(username, password){
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  var theUrl = "http://localhost:3000/api/users/";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({ "username": username, "password": password }));
}

function doLogin(username, password){
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  var theUrl = "http://localhost:3000/api/users/login";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({ "username": username, "password": password }));
}

function doLogout(){
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  var theUrl = "http://localhost:3000/api/users/logout";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send();
}

function createWebsocket(){
  var ws = new WebSocket("ws://localhost:3000/api/ws");
  ws.onmessage = function(event) {
    console.log(`Got reply: ${event.data}`);
  };
  return ws;
}
