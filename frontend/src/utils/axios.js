import axios from 'axios';

// Create an Axios instance with default configuration
const instance = axios.create({
  baseURL:
      process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL
        : 'http://127.0.0.1:5000/v1', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default instance;