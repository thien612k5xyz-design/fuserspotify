import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("spotify_token");
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success) {
            setUser(res.data);
          }
        } catch (error) {
          console.error("Token hết hạn hoặc lỗi:", error.message);
          localStorage.removeItem("spotify_token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        localStorage.setItem("spotify_token", res.data.token);
        setUser(res.data.user);
        return true;
      }
    } catch (error) {
      if (error.code === "INVALID_CREDENTIALS") {
        alert("Email hoặc mật khẩu không đúng");
      } else if (error.code === "ACCOUNT_BLOCKED") {
        alert("Tài khoản đã bị vô hiệu hóa");
      } else {
        alert(error.message || "Đăng nhập thất bại");
      }
    }
    return false;
  };

  // Đăng ký
  const register = async (display_name, email, password) => {
    try {
      const res = await authAPI.register({ display_name, email, password });
      if (res.success) {
        localStorage.setItem("spotify_token", res.data.token);
        setUser(res.data.user);
        return true;
      }
    } catch (error) {
      if (error.code === "EMAIL_EXISTS") {
        alert("Email đã được sử dụng");
      } else if (error.code === "INVALID_PASSWORD") {
        alert("Mật khẩu tối thiểu 8 ký tự");
      } else {
        alert(error.message || "Đăng ký thất bại");
      }
    }
    return false;
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API error:", error.message);
    } finally {
      localStorage.removeItem("spotify_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
