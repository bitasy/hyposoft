const TOKEN_KEY = "auth-token";
const USERNAME_KEY = "_username_";

export function getToken() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);
  return token && username && { token, username };
}

export function storeToken({ token, username }) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}
