import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Library, PlusSquare, Heart, User } from "lucide-react";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import "./Sidebar.css";

export const Sidebar = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-logo">Spotify</div>

        <div className="nav-menu">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Home size={24} /> Trang chủ
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Search size={24} /> Tìm kiếm
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Library size={24} /> Thư viện
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <User size={24} /> Hồ sơ cá nhân
          </NavLink>
        </div>

        <div className="divider"></div>

        <div className="sub-menu">
          <button onClick={() => setIsModalOpen(true)}>
            <div className="icon-box">
              <PlusSquare size={20} />
            </div>
            Tạo Playlist
          </button>

          <button onClick={() => navigate("/liked")}>
            <div className="icon-box gradient">
              <Heart size={20} fill="currentColor" />
            </div>
            Bài hát đã thích
          </button>
          <button onClick={() => navigate("/playlist")}>
            <div className="icon-box gradient">
              <Library size={20} fill="currentColor" />
            </div>
            Playlist của tôi
          </button>
        </div>
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
