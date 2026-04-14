import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (display_name, email, password) => {
    const res = await authAPI.register({ display_name, email, password });
    if (res.success) {
      setUser(res.data.user);
      if (res.data.token) localStorage.setItem("token", res.data.token);
    } else {
      throw new Error(res.message || "Đăng ký thất bại");
    }
    return res;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      setUser(res.data.user);
      if (res.data.token) localStorage.setItem("token", res.data.token);
    } else {
      throw new Error(res.message || "Đăng nhập thất bại");
    }
    return res;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("token");
    return true;
  };

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
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
