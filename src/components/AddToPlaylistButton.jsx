import React, { useState } from "react";
import { Plus, X, Music } from "lucide-react";
import { playlistAPI } from "../services/api";

export const AddToPlaylistButton = ({ songId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mở popup và tải danh sách playlist của User
  const handleOpenModal = async (e) => {
    e.stopPropagation(); // Ngăn click lan ra ngoài làm phát nhạc
    setIsOpen(true);
    setIsLoading(true);
    try {
      const res = await playlistAPI.getMyPlaylists();
      if (res.success) setPlaylists(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chọn 1 playlist để nhét bài hát vào
  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    try {
      await playlistAPI.addSongToPlaylist(playlistId, songId);
      alert("Đã thêm bài hát vào playlist!"); // Có thể thay bằng Toast báo thành công
      setIsOpen(false);
    } catch (error) {
      alert(error.message || "Lỗi khi thêm vào playlist");
    }
  };

  return (
    <>
      {/* NÚT BẤM (DẤU CỘNG) */}
      <button
        onClick={handleOpenModal}
        title="Thêm vào Playlist"
        style={{
          background: "transparent",
          border: "none",
          color: "#b3b3b3",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Plus size={20} />
      </button>

      {/* POPUP HIỆN RA KHI BẤM */}
      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 10000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#282828",
              padding: "24px",
              borderRadius: "8px",
              width: "350px",
              color: "white",
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "transparent",
                border: "none",
                color: "#b3b3b3",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>

            <h2
              style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px" }}
            >
              Thêm vào Playlist
            </h2>

            {isLoading ? (
              <p style={{ color: "#b3b3b3", textAlign: "center" }}>
                Đang tải...
              </p>
            ) : playlists.length > 0 ? (
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {playlists.map((pl) => (
                  <div
                    key={pl.playlist_id}
                    onClick={(e) => handleAddToPlaylist(pl.playlist_id, e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "10px",
                      background: "#181818",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#333")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#181818")
                    }
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#333",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "4px",
                      }}
                    >
                      {pl.cover_url ? (
                        <img
                          src={pl.cover_url}
                          alt="cover"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <Music size={20} color="#b3b3b3" />
                      )}
                    </div>
                    <span style={{ fontWeight: "bold" }}>{pl.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#b3b3b3", textAlign: "center" }}>
                Bạn chưa có playlist nào.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
