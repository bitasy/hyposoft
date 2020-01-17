import Cookies from 'js-cookie';
import * as Axios from 'axios';

const USE_MOCKED = true;

export const SESSION_COOKIE_NAME = Axios.defaults.xsrfCookieName; // maybe not

function login(username, password) {
  return Axios.post('', { username, password });
}

function mockedLogin(username, password) {
  Cookies.set(SESSION_COOKIE_NAME, 'mocked session cookie');
  return Promise.resolve();
}

function logout() {
  return Axios.post('');
}

function mockedLogout() {
  Cookies.remove(SESSION_COOKIE_NAME);
  return Promise.resolve();
}

const RealAPI = {
  login: login,
  logout: logout,
};

const MockedAPI = {
  login: mockedLogin,
  logout: mockedLogout,
}

export default USE_MOCKED ? MockedAPI : RealAPI;