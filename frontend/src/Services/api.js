import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL de ton backend Laravel
  headers: {
    'Content-Type': 'application/json',
  },
});
