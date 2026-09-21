import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Root route "/" redirects directly to "/dashboard".
 * Authenticated guards in BaseLayout ensure unauthenticated visits go to "/login".
 */
export default function IndexPage() {
  return <Navigate to="/dashboard" replace />;
}
