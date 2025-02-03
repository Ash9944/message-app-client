import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
  const isAuthenticated = userDetails && userDetails.userId && userDetails.token;

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
