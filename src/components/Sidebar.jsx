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
import "./Sidebar.css";

export const Sidebar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {}
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Spotify</div>

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

        {/* chỉ hiện khi đã đăng nhập */}
        {!loading && user && (
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

        <div className="sidebar-divider" />

        {/* Tạo Playlist */}
        {loading ? (
          <div
            className="nav-item disabled"
            aria-disabled="true"
            title="Đang kiểm tra phiên..."
          >
            <PlusSquare size={24} /> Tạo Playlist
          </div>
        ) : user ? (
          <div
            className="nav-item"
            onClick={() => setIsModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setIsModalOpen(true);
            }}
          >
            <PlusSquare size={24} /> Tạo Playlist
          </div>
        ) : (
          <Link
            to="/login"
            className="nav-item"
            title="Đăng nhập để tạo playlist"
          >
            <PlusSquare size={24} /> Tạo Playlist
          </Link>
        )}

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

      <div className="sidebar-divider" />

      <div className="sidebar-footer">
        {loading ? (
          <div className="user-info">
            <p className="user-name">Đang kiểm tra phiên...</p>
          </div>
        ) : user ? (
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

      {/* Modal chỉ mount khi đã đăng nhập */}
      {user && (
        <CreatePlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
