// src/pages/SongDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { songAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { LikeButton } from "../components/LikeButton";
import { AddToPlaylistButton } from "../components/AddToPlaylistButton";

const SongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playSong = usePlayerStore((state) => state.playSong);

  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        setIsLoading(true);
        const res = await songAPI.getSongById(id);
        if (res?.success) setSong(res.data);
      } catch (error) {
        console.error("Lỗi tải bài hát:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchSong();
  }, [id]);

  if (isLoading)
    return (
      <div style={{ padding: 50, color: "white" }}>Đang tải bài hát...</div>
    );

  if (!song)
    return (
      <div style={{ padding: 50, color: "white" }}>Không tìm thấy bài hát.</div>
    );

  return (
    <div
      style={{ padding: 30, color: "white", maxWidth: 1000, margin: "0 auto" }}
    >
      <div style={{ display: "flex", gap: 40, marginBottom: 50 }}>
        {/* Ảnh bìa */}
        <img
          src={song.cover_url}
          alt={song.title}
          style={{
            width: 300,
            height: 300,
            borderRadius: 12,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        />

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 10 }}>
            {song.title}
          </h1>
          <p
            style={{ fontSize: 24, color: "#b3b3b3", cursor: "pointer" }}
            onClick={() => navigate(`/artist/${song.artist?.artist_id}`)}
          >
            {song.artist?.name}
          </p>

          {/* Chỉ giữ Like và Add to Playlist */}
          <div style={{ margin: "30px 0", display: "flex", gap: 20 }}>
            <LikeButton
              songId={song.song_id}
              initialIsLiked={song.is_liked}
              initialLikeCount={song.like_count}
            />
            <AddToPlaylistButton songId={song.song_id} />
          </div>

          {/* Lời bài hát */}
          <div>
            <h3 style={{ color: "#1db954", marginBottom: 15 }}>Lời bài hát</h3>
            <div
              style={{
                background: "#181818",
                padding: 30,
                borderRadius: 12,
                lineHeight: 1.8,
                whiteSpace: "pre-line",
                maxHeight: 420,
                overflowY: "auto",
                fontSize: 16,
              }}
            >
              {song.lyrics ? (
                song.lyrics
              ) : (
                <p
                  style={{
                    color: "#666",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  Chưa có lời bài hát cho bài này.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
