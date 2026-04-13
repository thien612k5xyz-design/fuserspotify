import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm xử lý đăng nhập
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      setUser(res.data);
      if (res.data.token) localStorage.setItem("token", res.data.token);
    }
    return res;
  };

  // Hàm xử lý đăng xuất
  const logout = async () => {
    // nếu có API logout
    setUser(null);
    localStorage.removeItem("token");
    return true;
  };

  // Khi mount, kiểm tra token / lấy thông tin user
  useEffect(() => {
    let mounted = true;
    const fetchMe = async () => {
      try {
        const res = await authAPI.getMe();
        if (mounted && res.success) setUser(res.data);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Nếu có token trong localStorage thì gọi getMe, nếu không thì bỏ qua nhanh
    const token = localStorage.getItem("token");
    if (token) {
      fetchMe();
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
