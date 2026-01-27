import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  //if logged in redirect to post
  if (token) {
    return <Navigate to="/posts" replace />;
  }
  return children;
};
export default PublicRoute;
