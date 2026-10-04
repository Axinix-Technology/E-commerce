import React from "react";
import { Navigate } from "react-router-dom";

export default function PurchaseIndex() {
  return <Navigate to="/purchase/lot-generate" replace />;
}
