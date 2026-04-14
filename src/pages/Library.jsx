import React, { useState, useEffect } from "react";
import { songAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { LikeButton } from "../components/LikeButton";
import { Play } from "lucide-react";

const Library = () => {
  const [songs, setSongs] = useState([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const playSong = usePlayerStore((state) => state.playSong);

  const fetchLibrary = async (currentPage) => {
    setIsLoading(true);
    try {
      const res = await songAPI.getSongs({ page: currentPage, limit: 20 });
      if (res.success) {
        setSongs(res.data || []);

        // Normalize pagination from backend (support multiple key styles)
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
        console.warn("getSongs returned success=false", res);
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

  return (
    <div style={{ padding: "30px", color: "white" }}>
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
                  cursor: "pointer",
                }}
                onClick={() => playSong(song)}
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
                  }}
                />

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{song.title}</h4>
                  <p style={{ margin: 0, color: "#b3b3b3", fontSize: "14px" }}>
                    {song.artist?.name}
                  </p>
                </div>

                <LikeButton
                  songId={song.song_id}
                  initialIsLiked={song.is_liked}
                  initialLikeCount={song.like_count ?? 0}
                />

                <span style={{ color: "#b3b3b3", marginLeft: "20px" }}>
                  {song.duration_formatted}
                </span>
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
    </div>
  );
};

export default Library;
