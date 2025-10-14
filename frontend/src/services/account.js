import axios from 'axios';

export class Account {
  static IsLoggedIn() {
    return !!localStorage.getItem('auth_token');
  }
  static async login(email, password) {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data && response.data.data.token) {
        const token = response.data.data.token;
        localStorage.setItem('auth_token', token);
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }


  static logout() {
  localStorage.removeItem('auth_token');
  delete axios.defaults.headers.common['Authorization'];
  }
}

