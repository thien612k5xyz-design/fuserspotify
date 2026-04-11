import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 1. Import các Trạm quản lý (Context)
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

// 2. Import các Component cố định
import { Sidebar } from "./components/Sidebar";
import { MusicPlayer } from "./components/MusicPlayer";

// 3. Import tất cả các Trang (Pages)
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import LikedSongs from "./pages/LikedSongs";
import PlaylistDetail from "./pages/PlaylistDetail";
import Artist from "./pages/Artist";
import AlbumDetail from "./pages/AlbumDetail";
import MyPlaylists from "./pages/MyPlaylists";
import Queue from "./pages/Queue";
import Genre from "./pages/Genre";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";

// 4. Import CSS
import "./App.css";

function App() {
  return (
    // Bọc AuthProvider ở ngoài cùng để toàn bộ App biết trạng thái User
    <AuthProvider>
      {/* Bọc PlayerProvider ở trong để Trình phát nhạc hoạt động xuyên suốt */}
      <PlayerProvider>
        <Router>
          <div className="app-container">
            {/* Sidebar luôn nằm bên trái */}
            <Sidebar />

            {/* Nội dung chính thay đổi theo đường dẫn (Route) */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/liked" element={<LikedSongs />} />

                {/* CÁC TRANG CẦN TRUYỀN ID ĐÃ ĐƯỢC SỬA LẠI */}
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/genre/:id" element={<Genre />} />

                <Route path="/my-playlists" element={<MyPlaylists />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<UserDashboard />} />
              </Routes>
            </main>

            {/* Thanh Music Player luôn ghim ở dưới cùng */}
            <MusicPlayer />
          </div>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
