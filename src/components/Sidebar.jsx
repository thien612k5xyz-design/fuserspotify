// src/components/Sidebar.jsx
import React, { useContext, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PlayerContext } from "../context/PlayerContext";
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
  Users,
  LogOut,
  LayoutDashboard,
  Music,
  Disc3,
  DollarSign,
  BarChart2,
  UsersRound,
} from "lucide-react";
import "./Sidebar.css";

export const Sidebar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const { closePlayer } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {}
    try {
      await closePlayer();
    } catch (e) {}
    navigate("/");
  };

  const isAdmin = user && user.role === "admin";

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Spotify</div>

      <nav className="sidebar-nav">
        {/* ADMIN MENU */}
        {isAdmin && (
          <div
            className="admin-menu-section"
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <p
              style={{
                color: "#b3b3b3",
                fontSize: "11px",
                fontWeight: "bold",
                textTransform: "uppercase",
                paddingLeft: "16px",
                marginBottom: "8px",
                letterSpacing: "1px",
              }}
            >
              Quản trị viên
            </p>

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <LayoutDashboard size={24} /> Bảng điều khiển
            </NavLink>

            <NavLink
              to="/admin/songs"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Music size={24} /> Quản lý nội dung
            </NavLink>

            <NavLink
              to="/admin/artists"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Users size={24} /> Quản lý nghệ sĩ
            </NavLink>

            <NavLink
              to="/admin/albums"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Disc3 size={24} /> Quản lý album
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Users size={24} /> Quản lý người dùng
            </NavLink>

            <NavLink
              to="/admin/analytics/revenue"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <DollarSign size={24} /> Phân tích doanh thu
            </NavLink>

            <NavLink
              to="/admin/analytics/music"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <BarChart2 size={24} /> Phân tích âm nhạc
            </NavLink>

            <NavLink
              to="/admin/analytics/users"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <UsersRound size={24} /> Phân tích người dùng
            </NavLink>

            <div className="sidebar-divider" />
          </div>
        )}

        {/* REGULAR USER MENU */}
        {!isAdmin && (
          <>
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

            {user ? (
              <NavLink
                to="/liked"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                <Heart size={24} /> Bài hát đã thích
              </NavLink>
            ) : (
              <Link
                to="/login"
                className="nav-item"
                title="Đăng nhập để xem bài hát đã thích"
              >
                <Heart size={24} /> Bài hát đã thích
              </Link>
            )}

            {user ? (
              <NavLink
                to="/my-playlists"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                <ListMusic size={24} /> Playlist của tôi
              </NavLink>
            ) : (
              <Link
                to="/login"
                className="nav-item"
                title="Đăng nhập để xem playlist của bạn"
              >
                <ListMusic size={24} /> Playlist của tôi
              </Link>
            )}

            {!loading && user && (
              <NavLink
                to="/followed-artists"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                <Users size={24} /> Nghệ sĩ đã follow
              </NavLink>
            )}
          </>
        )}
      </nav>

      <div className="sidebar-divider" />

      {/* Footer / User block */}
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

      {/* Create playlist modal only for non-admin users */}
      {user && !isAdmin && (
        <CreatePlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
