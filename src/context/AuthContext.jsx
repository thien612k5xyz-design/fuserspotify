import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. KIỂM TRA ĐĂNG NHẬP (MOCK)
  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
    if (token) {
      // Nếu có token giả, tự động tạo ra một user giả lập y hệt Backend trả về
      setUser({
        user_id: 1,
        email: "test@example.com",
        display_name: "Vua Code Web",
        role: "user",
        plan: "premium", // Chỉnh thành 'free' nếu muốn test giao diện quảng cáo
        avatar_url: null,
        bio: "Yêu âm nhạc, thích code dạo",
        country: "Vietnam",
        date_of_birth: "2000-01-01",
        gender: "male",
      });
    }
    setLoading(false);
  }, []);

  // 2. HÀM ĐĂNG NHẬP GIẢ LẬP
  const login = async (email, password) => {
    // Không cần gọi API, giả vờ chờ 1 giây cho giống mạng thật
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Luôn luôn cho đăng nhập thành công
    localStorage.setItem("spotify_token", "fake_token_boc_thep_123");
    setUser({
      user_id: 1,
      email: email,
      display_name: "ad",
      role: "user",
      plan: "premium",
      avatar_url: null,
    });
    return true;
  };

  // 3. HÀM ĐĂNG KÝ GIẢ LẬP
  const register = async (display_name, email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    localStorage.setItem("spotify_token", "fake_token_boc_thep_123");
    setUser({
      user_id: 1,
      email: email,
      display_name: display_name,
      role: "user",
      plan: "free",
      avatar_url: null,
    });
    return true;
  };

  // 4. HÀM ĐĂNG XUẤT
  const logout = async () => {
    localStorage.removeItem("spotify_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
