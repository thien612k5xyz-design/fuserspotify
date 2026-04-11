import React, { useContext, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import {
  Home,
  Search,
  Library,
  User,
  BarChart3,
  PlusSquare,
  Heart,
  ListMusic,
  LogOut,
} from "lucide-react";
import "./Sidebar.css"; // Nhớ import file CSS vào đây!

export const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">Spotify</div>

      {/* MENU CHÍNH */}
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Home size={24} /> Trang chủ
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Search size={24} /> Tìm kiếm
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Library size={24} /> Thư viện
        </NavLink>

        {/* Chỉ hiện khi đã đăng nhập */}
        {user && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <BarChart3 size={24} /> Thống kê cá nhân
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <User size={24} /> Hồ sơ cá nhân
            </NavLink>
          </>
        )}

        <div className="sidebar-divider"></div>

        {/* NÚT TẠO PLAYLIST */}
        <div className="nav-item" onClick={() => setIsModalOpen(true)}>
          <PlusSquare size={24} /> Tạo Playlist
        </div>

        <NavLink
          to="/liked"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Heart size={24} /> Bài hát đã thích
        </NavLink>

        <NavLink
          to="/my-playlists"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <ListMusic size={24} /> Playlist của tôi
        </NavLink>
      </nav>

      <div className="sidebar-divider"></div>

      {/* KHU VỰC TÀI KHOẢN (ĐÁY SIDEBAR) */}
      <div className="sidebar-footer">
        {user ? (
          <div className="user-info">
            <p className="user-name">Chào, {user.display_name}</p>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={20} /> Đăng xuất
            </button>
          </div>
        ) : (
          <div className="guest-zone">
            <Link to="/register" className="btn-register">
              Đăng ký
            </Link>
            <Link to="/login" className="btn-login">
              Đăng nhập
            </Link>
          </div>
        )}
      </div>

      {/* POPUP TẠO PLAYLIST */}
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
