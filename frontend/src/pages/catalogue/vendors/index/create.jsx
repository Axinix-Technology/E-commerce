import React from "react";
import { Navigate } from "react-router-dom";

export default function VendorsIndexCreateRedirect() {
  return <Navigate to="/catalogue/vendors/create" replace />;
}
