import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Genre from "./pages/Genre";
import "./App.css";

function App() {
  return (
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
            <Route path="/playlist" element={<PlaylistDetail />} />
            <Route path="/artist" element={<Artist />} />
            <Route path="/album" element={<AlbumDetail />} />
            <Route path="/my-playlists" element={<MyPlaylists />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/genre" element={<Genre />} />
          </Routes>
        </main>
        <MusicPlayer />
      </div>
    </Router>
  );
}

export default App;
