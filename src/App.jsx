import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

import { Sidebar } from "./components/Sidebar";
import { MusicPlayer } from "./components/MusicPlayer";

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
import GenreDetail from "./pages/GenreDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import SongDetail from "./pages/SongDetail";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/liked" element={<LikedSongs />} />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/albums/:id" element={<AlbumDetail />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/my-playlists" element={<MyPlaylists />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/genre/:id" element={<GenreDetail />} />
              </Routes>
            </main>
            <MusicPlayer />
          </div>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
