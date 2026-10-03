import React from "react";
import { Navigate } from "react-router-dom";

export default function ReturnsIndexCreateRedirect() {
  return <Navigate to="/returns/create" replace />;
}
