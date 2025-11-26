// src/api/users.js
import axios from "axios";

const API_URL = "http://localhost:8000/api"; // ton backend Laravel

export const getUsers = async () => {
  return await axios.get(`${API_URL}/users`);
};

export const createUser = async (user) => {
  return await axios.post(`${API_URL}/users`, user);
};

export const updateUser = async (id, user) => {
  return await axios.put(`${API_URL}/users/${id}`, user);
};

export const deleteUser = async (id) => {
  return await axios.delete(`${API_URL}/users/${id}`);
};
