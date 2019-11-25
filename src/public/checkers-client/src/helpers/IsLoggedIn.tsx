function isLoggedIn(): boolean {
  return sessionStorage.getItem('loggedIn') === 'true' ? true : false;
}

export default isLoggedIn;