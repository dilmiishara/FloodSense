import axiosInstance from "../axios";
import { POSTS_API } from "../config/apiConfig";

// Get all posts
export const fetchPosts = () => {
  return axiosInstance.get(POSTS_API);
};

// Create post
export const savePost = (data) => {
  return axiosInstance.post(POSTS_API, data);
};

// Update post
export const updatePost = (id, data) => {
  return axiosInstance.put(`${POSTS_API}/${id}`, data);
};

// Delete post
export const deletePost = (id) => {
  return axiosInstance.delete(`${POSTS_API}/${id}`);
};