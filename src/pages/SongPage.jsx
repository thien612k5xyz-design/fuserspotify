import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "../components/LikeButton";
import { AddToPlaylistButton } from "../components/AddToPlaylistButton";
import { Play, ListPlus } from "lucide-react";
import "./AlbumDetail.css";

const SongPage = () => {
  const { id } = useParams();
  const { playSong, addToQueue } = useContext(PlayerContext);
  const [song, setSong] = useState(null);

  useEffect(() => {
    const fetchSong = async () => {
      const res = await songAPI.getSongById(id);
      if (res?.success) setSong(res.data);
    };
    fetchSong();
  }, [id]);

  if (!song)
    return (
      <div
        style={{
          color: "#b3b3b3",
          padding: "40px",
          textAlign: "center",
          fontSize: "18px",
        }}
      >
        Đang tải bài hát...
      </div>
    );

  return (
    <div
      style={{
        padding: "40px",
        color: "white",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #2b2b2b 0%, #121212 100%)",
      }}
    >
      {/* 1. HEADER: ẢNH BÌA VÀ THÔNG TIN */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "32px",
          marginBottom: "30px",
        }}
      >
        <img
          src={song.cover_url}
          alt={song.title}
          style={{
            width: "250px",
            height: "250px",
            borderRadius: "12px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
            objectFit: "cover",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Bài hát
          </span>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              margin: "0",
              lineHeight: "1.1",
              textShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            {song.title}
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "#b3b3b3",
              margin: "0",
              fontWeight: "500",
            }}
          >
            {song.artist?.name}
          </p>
        </div>
      </div>

      {/* 2. DÀN NÚT TƯƠNG TÁC (ĐẢM BẢO 100% HIỂN THỊ) */}
      <div
        className="album-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginTop: "20px",
        }}
      >
        {/* NÚT PLAY (Lấy class btn-play-album có sẵn của bạn) */}
        <button
          className="btn-play-album"
          onClick={() => playSong && playSong(song)}
          title="Phát nhạc"
        >
          <Play size={28} fill="currentColor" />
        </button>

        {/* NÚT LIKE */}
        <div style={{ transform: "scale(1.2)" }}>
          <LikeButton
            songId={song.song_id}
            initialIsLiked={song.is_liked}
            initialLikeCount={song.like_count}
          />
        </div>

        {/* NÚT THÊM PLAYLIST */}
        <AddToPlaylistButton songId={song.song_id} />

        {/* NÚT THÊM HÀNG CHỜ */}
        {addToQueue && (
          <button
            onClick={() => addToQueue(song)}
            title="Thêm vào hàng chờ"
            style={{
              background: "transparent",
              color: "#b3b3b3",
              border: "1px solid #b3b3b3",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderColor = "white";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#b3b3b3";
              e.currentTarget.style.borderColor = "#b3b3b3";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ListPlus size={20} />
            <span>Thêm vào danh sách chờ</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SongPage;
