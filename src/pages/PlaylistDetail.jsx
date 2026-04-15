import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { playlistAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "../components/LikeButton";
import { Music, Play, Trash2 } from "lucide-react";

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy playSong từ PlayerContext
  const { playSong } = useContext(PlayerContext);

  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await playlistAPI.getPlaylistById(id);
        if (res?.success) setPlaylist(res.data || null);
      } catch (error) {
        console.error("Lỗi lấy chi tiết playlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const handleRemoveSong = async (songId, e) => {
    e.stopPropagation();
    if (!window.confirm("Xóa bài này khỏi playlist?")) return;
    try {
      await playlistAPI.removeSongFromPlaylist(id, songId);
      setPlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((song) => song.song_id !== songId),
        total_songs: (prev.total_songs || 1) - 1,
      }));
    } catch (error) {
      alert("Lỗi khi xóa bài hát");
    }
  };

  const handleDeletePlaylist = async () => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa toàn bộ playlist này không?")
    )
      return;
    try {
      await playlistAPI.deletePlaylist(id);
      navigate("/my-playlists");
    } catch (error) {
      alert("Lỗi khi xóa playlist");
    }
  };

  if (isLoading)
    return <div style={{ padding: "50px", color: "white" }}>Đang tải...</div>;

  if (!playlist)
    return (
      <div style={{ padding: "50px", color: "white" }}>
        Playlist không tồn tại.
      </div>
    );

  return (
    <div style={{ padding: "30px", color: "white" }}>
      {/* HEADER PLAYLIST */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "232px",
            height: "232px",
            background: "#282828",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {playlist.cover_url ? (
            <img
              src={playlist.cover_url}
              alt="cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Music size={80} color="#b3b3b3" />
          )}
        </div>

        <div>
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Playlist
          </p>

          <h1 style={{ fontSize: "72px", margin: "10px 0", fontWeight: "900" }}>
            {playlist.name}
          </h1>

          <p style={{ margin: "0 0 10px 0", color: "#b3b3b3" }}>
            {playlist.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              color: "#b3b3b3",
            }}
          >
            <span style={{ color: "white", fontWeight: "bold" }}>
              {playlist.owner?.display_name || "Bạn"}
            </span>
            <span>•</span>
            <span>{playlist.total_songs || 0} bài hát</span>
          </div>
        </div>
      </div>

      {/* NÚT ĐIỀU KHIỂN CHUNG */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {playlist.songs?.length > 0 && (
          <button
            onClick={() => playSong(playlist.songs[0])}
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
            }}
          >
            <Play
              size={28}
              fill="black"
              color="black"
              style={{ marginLeft: "4px" }}
            />
          </button>
        )}

        <button
          onClick={handleDeletePlaylist}
          style={{
            background: "transparent",
            border: "none",
            color: "#b3b3b3",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Xóa Playlist
        </button>
      </div>

      {/* DANH SÁCH BÀI HÁT TRONG PLAYLIST */}
      <div>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #333",
            paddingBottom: "10px",
            marginBottom: "15px",
            color: "#b3b3b3",
            fontSize: "14px",
          }}
        >
          <span style={{ width: "30px" }}>#</span>
          <span style={{ flex: 1 }}>Tiêu đề</span>
          <span style={{ width: "100px", textAlign: "right" }}>Thời lượng</span>
        </div>

        {playlist.songs?.length > 0 ? (
          playlist.songs.map((song, index) => (
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
                  alt="cover"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "4px",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <h4 style={{ margin: 0, fontSize: "16px" }}>{song.title}</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#b3b3b3" }}>
                    {song.artist?.name}
                  </p>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <LikeButton
                  songId={song.song_id}
                  initialIsLiked={song.is_liked}
                  initialLikeCount={song.like_count}
                />

                <button
                  onClick={(e) => handleRemoveSong(song.song_id, e)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#b3b3b3",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                  title="Xóa khỏi playlist"
                >
                  <Trash2 size={18} />
                </button>

                <span
                  style={{
                    color: "#b3b3b3",
                    fontSize: "14px",
                    width: "50px",
                    textAlign: "right",
                  }}
                >
                  {song.duration_formatted}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{ padding: "50px", textAlign: "center", color: "#b3b3b3" }}
          >
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>
              Hãy tìm nội dung cho playlist của bạn
            </p>
            <p>Vào trang tìm kiếm hoặc trang chủ để chọn bài hát.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
