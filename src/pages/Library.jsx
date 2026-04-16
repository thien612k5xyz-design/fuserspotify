import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { songAPI, genreAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "../components/LikeButton";
import { Play, Plus } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Library = () => {
  const [allSongs, setAllSongs] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);

  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const { playSong, addToQueue } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const ICON_SIZE = 36;

  const [sortOption, setSortOption] = useState("newest");

  //danh sách Thể loại
  const fetchGenres = async () => {
    try {
      const res = await genreAPI.getGenres();
      if (res?.success) setGenres(res.data || []);
    } catch (err) {
      console.warn("Không lấy được genres:", err);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Lấy 1k bài
  const fetchAllSongs = async (currentGenreId) => {
    setIsLoading(true);
    try {
      const res = await songAPI.getSongs({
        page: 1,
        limit: 1000,
        genre_id: currentGenreId || undefined,
      });

      if (res?.success) {
        setAllSongs(res.data || []);
      } else {
        setAllSongs([]);
      }
    } catch (err) {
      console.error("Lỗi tải thư viện:", err);
      setAllSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi thay đổi Thể loại
  useEffect(() => {
    fetchAllSongs(selectedGenreId);
    setPage(1);
  }, [selectedGenreId]);

  useEffect(() => {
    if (!allSongs.length) {
      setDisplaySongs([]);
      setPagination({ totalPages: 1, currentPage: 1, total: 0 });
      return;
    }

    //Clone mảng
    let sortedData = [...allSongs];

    // sắp xếp
    if (sortOption === "a-z") {
      sortedData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "z-a") {
      sortedData.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === "views-desc") {
      sortedData.sort((a, b) => b.play_count - a.play_count);
    } else if (sortOption === "views-asc") {
      sortedData.sort((a, b) => a.play_count - b.play_count);
    } else if (sortOption === "newest") {
      sortedData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    } else if (sortOption === "oldest") {
      sortedData.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    setDisplaySongs(paginatedData);
    setPagination({
      totalPages: Math.ceil(sortedData.length / limit) || 1,
      currentPage: page,
      total: sortedData.length,
    });
  }, [allSongs, sortOption, page]);

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

  const handleAddToQueue = (song) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToQueue(song);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(`Đã thêm "${song.title}" vào hàng đợi`);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const onSelectGenre = (genreId) => {
    setSelectedGenreId((prev) => (prev === genreId ? null : genreId));
  };

  const onSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ padding: "30px", color: "white", position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "42px", margin: 0 }}>Thư viện của bạn</h1>

        {/*Sắp xếp */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <label
            style={{ color: "#b3b3b3", fontSize: "13px", marginRight: "6px" }}
          >
            Sắp xếp:
          </label>
          <select
            value={sortOption}
            onChange={onSortChange}
            style={{
              background: "#181818",
              color: "white",
              border: "1px solid #333",
              padding: "8px 10px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <option value="a-z">Tên bài hát (A - Z)</option>
            <option value="z-a">Tên bài hát (Z - A)</option>
            <option value="views-desc">Nghe nhiều nhất</option>
            <option value="views-asc">Nghe ít nhất</option>
            <option value="newest">Mới thêm gần đây</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/*nút Thể loại */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => onSelectGenre(null)}
            style={{
              minWidth: 120,
              padding: "10px 14px",
              background: selectedGenreId === null ? "#1db954" : "#181818",
              color: selectedGenreId === null ? "#000" : "#b3b3b3",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Tất cả thể loại
          </button>

          {genres.map((g) => {
            const gid = g.genre_id || g.id;
            const isActive = selectedGenreId === gid;
            return (
              <button
                key={gid}
                onClick={() => onSelectGenre(gid)}
                style={{
                  minWidth: 120,
                  padding: "10px 14px",
                  background: isActive ? "#1db954" : "#181818",
                  color: isActive ? "#000" : "#b3b3b3",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: g.color || "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {g.name?.slice(0, 1)?.toUpperCase() || "G"}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "#9a9a9a" }}>
                    {g.total_songs ? `${g.total_songs} bài` : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách bài hát*/}
      {isLoading ? (
        <p style={{ color: "#b3b3b3" }}>Đang tải thư viện...</p>
      ) : (
        <>
          <div style={{ marginBottom: "30px" }}>
            {displaySongs.map((song, index) => (
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
                  {(page - 1) * limit + index + 1}
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
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#b3b3b3",
                      cursor: "pointer",
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      borderRadius: "50%",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>❤</span>
                  </button>
                )}
                <span style={{ color: "#b3b3b3", marginLeft: "10px" }}>
                  {song.duration_formatted}
                </span>

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
                >
                  <Play size={18} color="black" />
                </button>
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
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}

            {/*khi chọn Thể loại trống */}
            {displaySongs.length === 0 && (
              <p style={{ color: "#b3b3b3" }}>Không có bài hát nào.</p>
            )}
          </div>

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
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
                Trang {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                style={{
                  padding: "10px 20px",
                  background: "#282828",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor:
                    page >= pagination.totalPages ? "not-allowed" : "pointer",
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
};

export default Library;
