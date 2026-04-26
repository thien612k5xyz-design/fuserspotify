import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api"; // Thêm import này

const Login = () => {
  const { login } = useContext(AuthContext); // Hàm login của Context (lưu token)
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Gọi hàm login từ AuthContext (nó đã tự gọi API và lưu token rồi)
      const res = await login(email, password);

      // Đăng nhập thành công -> Phân luồng điều hướng luôn
      if (res && res.data && res.data.user) {
        if (res.data.user.role === "admin") {
          navigate("/admin/dashboard"); // Admin về Dashboard
        } else {
          navigate("/"); // User về trang chủ
        }
      } else {
        // Phòng hờ API trả về thiếu data
        navigate("/");
      }
    } catch (err) {
      setErrorMsg(
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại Backend.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "50px",
        color: "white",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Đăng Nhập Spotify
      </h2>

      {errorMsg && (
        <p
          style={{ color: "#e91429", textAlign: "center", fontWeight: "bold" }}
        >
          {errorMsg}
        </p>
      )}

      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "14px",
            borderRadius: "5px",
            border: "none",
            outline: "none",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "14px",
            borderRadius: "5px",
            border: "none",
            outline: "none",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "14px",
            background: "#1db954",
            color: "black",
            border: "none",
            borderRadius: "50px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      <p style={{ marginTop: "25px", textAlign: "center", color: "#b3b3b3" }}>
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          style={{
            color: "white",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};
export default Login;
