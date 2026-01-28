import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { JSX } from "react";

// This component protects routes that require login
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // get token from browser storage
  const { token } = useAuth();

  // if no token → user not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // if token exists → allow access
  return children;
};

export default ProtectedRoute;
