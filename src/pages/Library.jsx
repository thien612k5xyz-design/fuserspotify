import React, { useState, useEffect } from "react";
import { songAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { LikeButton } from "../components/LikeButton";
import { Play, Music } from "lucide-react";
import "./Library.css";

const Library = () => {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const playSong = usePlayerStore((state) => state.playSong);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await songAPI.getSongs();
        if (res.success) setSongs(res.data);
      } catch (error) {
        console.error("Lỗi tải thư viện:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, []);

  if (isLoading) return <div className="loading">Đang tải thư viện...</div>;

  return (
    <div className="library-page" style={{ padding: "30px", color: "white" }}>
      <h1 style={{ marginBottom: "30px" }}>Thư viện bài hát</h1>

      <div className="song-list">
        {songs.map((song, index) => (
          <div
            key={song.song_id || song.id}
            className="song-item-row"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              borderRadius: "8px",
              transition: "background 0.3s",
            }}
          >
            <span style={{ width: "30px", color: "#b3b3b3" }}>{index + 1}</span>

            <div
              onClick={() => playSong(song)}
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                cursor: "pointer",
                gap: "15px",
              }}
            >
              <img
                src={song.cover_url}
                alt=""
                style={{ width: "40px", height: "40px", borderRadius: "4px" }}
              />
              <div>
                <h4 style={{ margin: 0 }}>{song.title}</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#b3b3b3" }}>
                  {song.artist?.name || song.artist}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <LikeButton
                songId={song.song_id || song.id}
                initialIsLiked={song.is_liked}
                initialLikeCount={song.like_count}
              />
              <span
                style={{ color: "#b3b3b3", fontSize: "14px", width: "50px" }}
              >
                {song.duration_formatted}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
