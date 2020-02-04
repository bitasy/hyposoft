const TOKEN_KEY = "auth-token";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
