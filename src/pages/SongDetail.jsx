import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { songAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play } from "lucide-react";
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
        if (res.success) setSong(res.data);
      } catch (error) {
        console.error("Lỗi tải bài hát:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (isLoading)
    return (
      <div style={{ padding: "50px", color: "white" }}>Đang tải bài hát...</div>
    );
  if (!song)
    return (
      <div style={{ padding: "50px", color: "white" }}>
        Không tìm thấy bài hát.
      </div>
    );

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "25px",
          marginBottom: "30px",
        }}
      >
        <img
          src={song.cover_url}
          alt={song.title}
          style={{
            width: "232px",
            height: "232px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        />
        <div>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>Bài hát</span>
          <h1 style={{ fontSize: "48px", margin: "10px 0", fontWeight: "900" }}>
            {song.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
            }}
          >
            <span
              onClick={() =>
                navigate(`/artist/${song.artist?.artist_id || song.artist_id}`)
              }
              style={{ fontWeight: "bold", cursor: "pointer" }}
              className="hover-underline"
            >
              {song.artist?.name || "Nghệ sĩ"}
            </span>
            <span>•</span>
            <span
              onClick={() =>
                song.album && navigate(`/album/${song.album.album_id}`)
              }
              style={{ cursor: "pointer", color: "#b3b3b3" }}
              className={song.album ? "hover-underline" : ""}
            >
              {song.album?.title || "Single"}
            </span>
            <span>•</span>
            <span style={{ color: "#b3b3b3" }}>{song.duration_formatted}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <button
          onClick={() => playSong(song)}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#1db954",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Play size={28} fill="black" />
        </button>
        <LikeButton
          songId={song.song_id}
          initialIsLiked={song.is_liked}
          initialLikeCount={song.like_count}
        />
        <AddToPlaylistButton songId={song.song_id} />
      </div>
    </div>
  );
};

export default SongDetail;
