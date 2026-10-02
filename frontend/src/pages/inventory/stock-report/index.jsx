import React from "react";
import { Navigate } from "react-router-dom";

export default function StockReportRedirect() {
  return <Navigate to="/reports/stock-summary" replace />;
}
