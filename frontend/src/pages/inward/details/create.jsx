import React from "react";
import { Navigate } from "react-router-dom";

export default function InwardDetailsCreateRedirect() {
  return <Navigate to="/inward/create" replace />;
}
