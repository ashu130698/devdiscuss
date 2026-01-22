import type { JSX } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  //if logged in redirect to post
  if (token) {
    return <Navigate to="/posts" replace />;
  }
  return children;
};
export default PublicRoute;
