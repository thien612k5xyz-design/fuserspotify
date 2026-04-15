import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import { LikeButton } from "../components/LikeButton";
import { Heart, Play } from "lucide-react";

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy playSong và setQueueAndPlay từ PlayerContext
  const { playSong, setQueueAndPlay } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchLikedSongs = async () => {
      try {
        const res = await songAPI.getLikedSongs();
        if (res?.success) setLikedSongs(res.data || []);
      } catch (error) {
        console.error("Lỗi tải bài hát đã thích:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedSongs();
  }, [user, navigate]);

  if (isLoading)
    return (
      <div style={{ color: "white", padding: "30px" }}>
        Đang tìm lại những bài hát của bạn ...
      </div>
    );

  return (
    <div
      className="liked-songs-page"
      style={{ padding: "30px", color: "white" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* Bên trái: hình trái tim lớn và nút play đặt dưới hình, căn trái */}
        <div
          style={{
            width: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              background: "linear-gradient(135deg, #450af5, #c4efd9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "8px",
            }}
          >
            <Heart size={80} fill="white" color="white" />
          </div>

          {/* Nút Play to nằm dưới hình trái tim, thẳng hàng với mép trái của hình */}
          {likedSongs.length > 0 && (
            <button
              onClick={() => setQueueAndPlay(likedSongs, 0)}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#1db954",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "flex-start",
                marginLeft: 0,
              }}
              title="Phát tất cả"
            >
              <Play
                size={28}
                fill="black"
                color="black"
                style={{ marginLeft: "4px" }}
              />
            </button>
          )}
        </div>

        {/* Bên phải: thông tin tiêu đề và số lượng */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          >
            Playlist
          </p>
          <h1 style={{ fontSize: "72px", margin: "10px 0" }}>
            Bài hát đã thích
          </h1>
          <p style={{ margin: 0, color: "#b3b3b3" }}>
            {likedSongs.length} bài hát
          </p>
        </div>
      </div>

      <div className="song-list">
        {likedSongs.length > 0 ? (
          likedSongs.map((song, index) => (
            <div
              key={song.song_id || song.id}
              className="song-item-row"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <span style={{ width: "30px", color: "#b3b3b3" }}>
                {index + 1}
              </span>

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
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />

                <div>
                  <h4 style={{ margin: 0 }}>{song.title}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#b3b3b3" }}>
                    {song.artist?.name}
                  </p>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <LikeButton
                  songId={song.song_id}
                  initialIsLiked={true}
                  initialLikeCount={song.like_count}
                />

                <span style={{ color: "#b3b3b3", fontSize: "14px" }}>
                  {song.duration_formatted}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p
            style={{ textAlign: "center", marginTop: "50px", color: "#b3b3b3" }}
          >
            Bạn chưa thích bài hát nào
          </p>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
