import React from "react";
import { Navigate } from "react-router-dom";

export default function OrdersRoot() {
  return <Navigate to="/orders/advance" replace />;
}
