import React from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Trash2 } from "lucide-react";
import "./Queue.css";

const Queue = () => {
  const { queue, currentSong, currentIndex, playSong, removeFromQueue } =
    usePlayerStore();

  const upNextSongs = queue.slice(currentIndex + 1);

  return (
    <div className="queue-container">
      <h1 className="queue-title">Hàng đợi phát</h1>

      {currentSong && (
        <div className="now-playing-section">
          <h3>Đang phát</h3>
          <div className="queue-item active">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <img
                src={currentSong.coverUrl}
                alt="cover"
                style={{ width: 48, height: 48, borderRadius: 4 }}
              />
              <div>
                <h4 style={{ color: "#10b981", fontWeight: "bold" }}>
                  {currentSong.title}
                </h4>
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  {currentSong.artist}
                </p>
              </div>
            </div>
            <div style={{ color: "#10b981" }}>
              <Play size={20} fill="currentColor" />
            </div>
          </div>
        </div>
      )}

      {upNextSongs.length > 0 && (
        <div className="up-next-section">
          <h3>Tiếp theo</h3>
          {upNextSongs.map((song, index) => (
            <div key={`${song.id}-${index}`} className="queue-item">
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onDoubleClick={() => playSong(song, queue)}
              >
                <img
                  src={song.coverUrl}
                  alt="cover"
                  style={{ width: 48, height: 48, borderRadius: 4 }}
                />
                <div>
                  <h4 style={{ color: "white", fontWeight: "bold" }}>
                    {song.title}
                  </h4>
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    {song.artist}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromQueue(song.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
                title="Xóa khỏi Hàng đợi"
              >
                <Trash2 size={20} className="hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {upNextSongs.length === 0 && (
        <p style={{ color: "#9ca3af", marginTop: "2rem" }}>
          Không có bài hát nào tiếp theo trong hàng đợi.
        </p>
      )}
    </div>
  );
};

export default Queue;
