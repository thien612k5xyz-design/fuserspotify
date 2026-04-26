import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const AdminRoute = () => {
  const { user } = useContext(AuthContext);
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#b3b3b3",
          fontSize: 14,
        }}
      >
        Đang kiểm tra quyền...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Đủ quyền -> Cho phép truy cập vào các component con bên trong
  return <Outlet />;
};
