// ─── src/api/routes.js ─────────────────────────────────────────────────────
// test

import axios from "axios";

// Base Axios instance
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── POSTS API ───────────────────────────────────────────────────────────

// Get all posts
export const getPosts = async () => {
  try {
    const response = await API.get("/posts");
    return response.data;
  } catch (error) {
    console.error("Get Posts Error:", error);
    throw error;
  }
};

// Create post
export const createPost = async (data) => {
  try {
    const response = await API.post("/posts", data);
    return response.data;
  } catch (error) {
    console.error("Create Post Error:", error);
    throw error;
  }
};

// Update post
export const updatePost = async (id, data) => {
  try {
    const response = await API.put(`/posts/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update Post Error:", error);
    throw error;
  }
};

// Delete post
export const deletePost = async (id) => {
  try {
    const response = await API.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Post Error:", error);
    throw error;
  }
};