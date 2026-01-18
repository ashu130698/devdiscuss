//axios = library to call HTTP api's
import axios from "axios";

//create a base axios instance
const API = axios.create({
  baseURL: "http://localhost:4000",
});

//interceptor= run before every api call
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;