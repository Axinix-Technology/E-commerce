import React from "react";
import BaseLayout from "./layouts/baseLayouts";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "glass-panel text-slate-100 border border-slate-700/80 text-xs font-medium",
          duration: 3500,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }
        }}
      />
      <BaseLayout />
    </>
  );
}
