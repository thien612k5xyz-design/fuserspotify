import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(displayName, email, password);
      alert("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Đăng ký thất bại");
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
      <h2>Đăng Ký Spotify</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form
        onSubmit={handleRegister}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Tên hiển thị"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
        />
        <input
          type="password"
          placeholder="Mật khẩu (tối thiểu 8 ký tự)"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#1db954",
            border: "none",
            borderRadius: "50px",
            fontWeight: "bold",
          }}
        >
          Đăng ký miễn phí
        </button>
      </form>
      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Đã có tài khoản?{" "}
        <Link to="/login" style={{ color: "#1db954" }}>
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default Register;
