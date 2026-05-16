import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signupAPI = (data) => API.post("/auth/signup", data);
export const loginAPI = (data) => API.post("/auth/login", data);
export const getMeAPI = () => API.get("/auth/me");

// Blog APIs
export const getAllBlogsAPI = (params) => API.get("/blogs", { params });
export const getMyBlogsAPI = () => API.get("/blogs/my");
export const getBlogByIdAPI = (id) => API.get(`/blogs/${id}`);
export const createBlogAPI = (data) => API.post("/blogs", data);
export const updateBlogAPI = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlogAPI = (id) => API.delete(`/blogs/${id}`);
export const toggleLikeAPI = (id) => API.put(`/blogs/${id}/like`);

// Comment APIs
export const addCommentAPI = (data) => API.post("/comments", data);
export const deleteCommentAPI = (id) => API.delete(`/comments/${id}`);

export default API;
