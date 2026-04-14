import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { genreAPI, songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "../components/LikeButton";
import { Play } from "lucide-react";

const GenreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(PlayerContext);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // Gọi API lấy bài hát theo thể loại
        const res = await genreAPI.getGenreSongs(id);
        if (res.success) {
          // data có thể chứa mảng danh sách bài hát
          setSongs(res.data?.data || res.data || []);
        }
      } catch (error) {
        console.error("Lỗi tải bài hát thể loại:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, [id]);

  // Hàm mồi để play nhạc nếu nó là bài tóm tắt
  const handlePlay = async (song) => {
    if (song.file_url) {
      playSong(song);
      return;
    }
    // Nếu thiếu file_url, lấy chi tiết
    try {
      const res = await songAPI.getSongById(song.song_id);
      if (res.success) playSong(res.data);
    } catch (error) {
      console.error("Lỗi phát nhạc:", error);
    }
  };

  if (isLoading)
    return <div style={{ padding: "30px", color: "white" }}>Đang tải...</div>;

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent",
          border: "none",
          color: "#b3b3b3",
          cursor: "pointer",
          marginBottom: "20px",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        ← Quay lại Tìm kiếm
      </button>

      <h1 style={{ fontSize: "48px", fontWeight: "900", marginBottom: "40px" }}>
        Tuyển tập Thể loại
      </h1>

      {songs.length === 0 ? (
        <p style={{ color: "#b3b3b3", fontSize: "18px" }}>
          Chưa có bài hát nào thuộc thể loại này.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {songs.map((song) => (
            <div
              key={song.song_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px 15px",
                background: "#181818",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#282828")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#181818")
              }
            >
              <div
                onClick={() => handlePlay(song)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  flex: 1,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <img
                    src={song.cover_url}
                    alt="cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0,0,0,0.5)",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                    }}
                    className="play-overlay"
                  >
                    <Play fill="white" size={16} />
                  </div>
                </div>
                <div>
                  <h4
                    style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}
                  >
                    {song.title}
                  </h4>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#b3b3b3",
                      fontSize: "14px",
                    }}
                  >
                    {song.artist?.name || song.artist_name || "Nghệ sĩ ẩn danh"}
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <LikeButton
                  songId={song.song_id}
                  initialIsLiked={song.is_liked}
                  initialLikeCount={song.like_count}
                />
                <span
                  style={{
                    color: "#b3b3b3",
                    fontSize: "14px",
                    width: "40px",
                    textAlign: "right",
                  }}
                >
                  {song.duration_formatted}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreDetail;
