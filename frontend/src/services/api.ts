//axios = library to call HTTP api's
import axios from "axios";

//create a base axios instance
const API = axios.create({
  baseURL: "https://devdiscuss-eqem.onrender.com",
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
