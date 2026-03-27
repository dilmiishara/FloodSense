// ─── src/api/posts.js ─────────────────────────────────────────────

import API from "./axios";

// Get all posts
export const getPosts = async () => {
  const res = await API.get("/posts");
  return res.data;
};

// Create post
export const createPost = async (data) => {
  const res = await API.post("/posts", data);
  return res.data;
};

// Update post
export const updatePost = async (id, data) => {
  const res = await API.put(`/posts/${id}`, data);
  return res.data;
};

// Delete post
export const deletePost = async (id) => {
  const res = await API.delete(`/posts/${id}`);
  return res.data;
};