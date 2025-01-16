import React from "react";
import { Navigate, Route } from "react-router-dom";
import { useUser } from "../contexts/user.context";

const PrivateRoute = ({ element, allowedRoles, ...rest }) => {
  const { user, loading } = useUser();

  // While loading user data, do not render anything
  if (loading) return null;

  // If the user is not logged in or their role is not allowed, redirect to login
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  // Render the element if the user is allowed
  return <Route {...rest} element={element} />;
};

export default PrivateRoute;
