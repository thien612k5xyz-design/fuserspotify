import React, { useState, useEffect } from "react";
import { songAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { LikeButton } from "../components/LikeButton";
import { Heart } from "lucide-react";

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const playSong = usePlayerStore((state) => state.playSong);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const res = await songAPI.getLikedSongs(); // GET /api/songs/liked
        if (res.success) setLikedSongs(res.data);
      } catch (error) {
        console.error("Lỗi tải bài hát đã thích:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikedSongs();
  }, []);

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
          alignItems: "center",
          gap: "20px",
          marginBottom: "40px",
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
        <div>
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
              key={song.song_id}
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
                  style={{ width: "40px", height: "40px" }}
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
                {/* Nút Like ở đây sẽ giúp bạn "unlike" bài hát ngay tại chỗ */}
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
            Bạn chưa thả tim bài hát nào cả. Hãy khám phá thêm nhé!
          </p>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
