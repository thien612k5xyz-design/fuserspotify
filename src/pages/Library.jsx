import React, { useState, useEffect, useContext } from "react";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { Play, Heart } from "lucide-react";
import "./Library.css";

const Library = () => {
  const { playSong } = useContext(PlayerContext);

  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLikedSongs = async (pageToFetch = 1) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await songAPI.getLikedSongs({ page: pageToFetch, limit: 20 });
      if (res && res.success) {
        // res.data: array of songs
        // res.pagination: may be undefined if API doesn't return it
        setSongs(Array.isArray(res.data) ? res.data : []);
        const pag = res.pagination || {
          total: (res.data || []).length,
          page: pageToFetch,
          limit: 20,
          totalPages: 1,
        };
        setPagination({
          total: pag.total ?? (res.data ? res.data.length : 0),
          page: pag.page ?? pageToFetch,
          limit: pag.limit ?? 20,
          totalPages: pag.totalPages ?? 1,
        });
      } else {
        setSongs([]);
        setPagination({
          total: 0,
          page: pageToFetch,
          limit: 20,
          totalPages: 1,
        });
      }
    } catch (err) {
      console.error("Lỗi tải thư viện:", err);
      setError("Không thể tải thư viện. Vui lòng thử lại.");
      setSongs([]);
      setPagination({ total: 0, page: pageToFetch, limit: 20, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  if (isLoading)
    return <div className="loading-state">Đang tải thư viện...</div>;

  return (
    <div className="library-container">
      <div className="library-header">
        <h1 className="library-title">Thư viện bài hát</h1>
        <p className="library-subtitle">
          {pagination.total || 0} bài hát đã thích
        </p>
      </div>

      <div className="song-list">
        {songs.length === 0 ? (
          <p className="empty-text">Bạn chưa thích bài hát nào.</p>
        ) : (
          songs.map((song, index) => (
            <div
              key={song.song_id}
              className="song-table-row"
              onClick={() => playSong(song)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") playSong(song);
              }}
            >
              <div className="cell-index">
                {index + 1 + (pagination.page - 1) * pagination.limit}
              </div>

              <div className="cell-info">
                <img src={song.cover_url} alt={song.title} />
                <div>
                  <div className="cell-title">{song.title}</div>
                  <div className="cell-artist">
                    {song.artist?.name || "Unknown"}
                  </div>
                </div>
              </div>

              <div className="cell-album">{song.album || "-"}</div>
              <div className="cell-genre">{song.genre || "-"}</div>

              <div className="cell-actions">
                <Heart size={18} fill="#1ed760" color="#1ed760" />
                <div className="cell-duration">
                  {song.duration_formatted || "0:00"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Trang trước
          </button>

          <span className="page-indicator">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Trang sau
          </button>
        </div>
      )}

      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default Library;
