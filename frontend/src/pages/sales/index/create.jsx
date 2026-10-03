import React from "react";
import { Navigate } from "react-router-dom";

export default function SalesIndexCreateRedirect() {
  return <Navigate to="/sales/create" replace />;
}
