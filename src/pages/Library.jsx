import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "../components/LikeButton";
import { Play, Plus } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Library = () => {
  const [songs, setSongs] = useState([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // State quản lý thông báo
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Lấy playSong và addToQueue từ PlayerContext
  const { playSong, addToQueue } = useContext(PlayerContext);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const ICON_SIZE = 36; // px

  const fetchLibrary = async (currentPage) => {
    setIsLoading(true);
    try {
      const res = await songAPI.getSongs({ page: currentPage, limit: 20 });
      if (res.success) {
        setSongs(res.data || []);
        const pag = res.pagination || {};
        let totalPages =
          pag.totalPages ??
          pag.total_pages ??
          (pag.total && pag.limit
            ? Math.max(1, Math.ceil(Number(pag.total) / Number(pag.limit)))
            : undefined) ??
          pag.total ??
          1;
        let current =
          pag.currentPage ?? pag.current_page ?? pag.page ?? currentPage;
        totalPages = Number(totalPages) || 1;
        current = Number(current) || currentPage;
        setPagination({ totalPages, currentPage: current });
      } else {
        setSongs([]);
        setPagination({ totalPages: 1, currentPage: currentPage });
      }
    } catch (err) {
      console.error("Lỗi tải thư viện:", err);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary(page);
  }, [page]);

  const totalPages = pagination.totalPages || 1;

  const handlePlaySong = async (song) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (!song.file_url) {
        const res = await songAPI.getSongById(song.song_id);
        if (res?.success && res.data) {
          playSong(res.data);
          return;
        }
      }
      playSong(song);
    } catch (err) {
      console.error("Lỗi phát nhạc:", err);
    }
  };

  // thêm vào hàng đợi + Hiện thông báo
  const handleAddToQueue = (song) => {
    if (!user) {
      navigate("/login");
      return;
    }

    addToQueue(song);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(`Đã thêm "${song.title}" vào hàng đợi`);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div style={{ padding: "30px", color: "white", position: "relative" }}>
      <h1 style={{ fontSize: "42px", marginBottom: "30px" }}>
        Thư viện của bạn
      </h1>

      {isLoading ? (
        <p style={{ color: "#b3b3b3" }}>Đang tải thư viện...</p>
      ) : (
        <>
          <div style={{ marginBottom: "30px" }}>
            {songs.map((song, index) => (
              <div
                key={song.song_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #282828",
                }}
              >
                <span style={{ width: "40px", color: "#b3b3b3" }}>
                  {(page - 1) * 20 + index + 1}
                </span>

                <img
                  src={song.cover_url}
                  alt=""
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "4px",
                    marginRight: "15px",
                    cursor: "pointer",
                  }}
                  onClick={() => handlePlaySong(song)}
                />

                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => handlePlaySong(song)}
                >
                  <h4 style={{ margin: 0 }}>{song.title}</h4>
                  <p style={{ margin: 0, color: "#b3b3b3", fontSize: "14px" }}>
                    {song.artist?.name}
                  </p>
                </div>

                {/* Like / Tim */}
                {user ? (
                  <div style={{ marginRight: 20 }}>
                    <LikeButton
                      songId={song.song_id}
                      initialIsLiked={song.is_liked}
                      initialLikeCount={song.like_count ?? 0}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    title="Đăng nhập để thích"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#b3b3b3",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      borderRadius: "50%",
                      transition: "background 0.15s, transform 0.08s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>❤</span>
                  </button>
                )}

                <span style={{ color: "#b3b3b3", marginLeft: "10px" }}>
                  {song.duration_formatted}
                </span>

                {/* Nút Play */}
                <button
                  style={{
                    marginLeft: "15px",
                    background: "#1db954",
                    border: "none",
                    borderRadius: "50%",
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handlePlaySong(song)}
                  title="Phát"
                >
                  <Play size={18} color="black" />
                </button>

                {/* Nút Add to Queue */}
                <button
                  style={{
                    marginLeft: "10px",
                    background: "#282828",
                    border: "none",
                    borderRadius: "50%",
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                  }}
                  onClick={() => handleAddToQueue(song)}
                  title="Thêm vào hàng đợi"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "40px",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: "10px 20px",
                background: "#282828",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Trước
            </button>

            <span
              style={{
                padding: "10px 20px",
                background: "#1db954",
                color: "black",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Trang {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: "10px 20px",
                background: "#282828",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Sau →
            </button>
          </div>
        </>
      )}

      {/* Giao diện Thông báo (Toast) */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1db954",
            color: "#000",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <div
            style={{
              background: "#000",
              color: "#1db954",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            ✓
          </div>
          {toastMessage}
        </div>
      )}

      {/* css animation hiển thị */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Library;
