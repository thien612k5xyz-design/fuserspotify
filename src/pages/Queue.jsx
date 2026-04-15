import React, { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import SongListItem from "../components/SongListItem";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./queue.css";

const Queue = () => {
  const { queue, currentIndex, playSong, removeFromQueue, setQueueAndPlay } =
    useContext(PlayerContext);
  const [selectedSong, setSelectedSong] = useState(null);

  if (!queue || queue.length === 0) {
    return <div className="queue-empty">Hàng đợi trống</div>;
  }

  return (
    <div className="queue-container">
      <div className="queue-header">
        <h2 className="queue-title">Hàng đợi phát</h2>
        <div className="queue-actions">
          <button
            className="btn-secondary"
            onClick={() => setQueueAndPlay(queue, 0)}
          >
            Phát từ đầu
          </button>
        </div>
      </div>

      <div className="queue-list">
        {queue.map((song, i) => (
          <div
            key={`${song.song_id || song.id}-${i}`}
            className="queue-item-wrapper"
          >
            <SongListItem
              song={song}
              onPlay={() => playSong(song)}
              onAddToQueue={() => setSelectedSong(song)}
              isActive={i === currentIndex}
            />
            <div className="queue-item-controls">
              <button
                className="btn-link remove-btn"
                onClick={() => removeFromQueue(song.song_id || song.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm vào Playlist */}
      <AddToPlaylistModal
        isOpen={!!selectedSong}
        onClose={() => setSelectedSong(null)}
        song={selectedSong}
      />
    </div>
  );
};

export default Queue;
