import React from "react";
import { Navigate } from "react-router-dom";

export default function MastersIndex() {
  return <Navigate to="/masters/employees" replace />;
}
