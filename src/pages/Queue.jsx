import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import SongListItem from "../components/SongListItem";
import "./queue.css";

const Queue = () => {
  const {
    queue,
    currentIndex,
    playSong,
    addToQueue,
    removeFromQueue,
    setQueueAndPlay,
  } = useContext(PlayerContext);

  if (!queue || queue.length === 0)
    return <div className="queue-empty">Hàng đợi trống</div>;

  return (
    <div className="queue-container">
      <div className="queue-header">
        <h2 className="queue-title">Hàng đợi phát</h2>
        <div className="queue-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              // play from start
              setQueueAndPlay(queue, 0);
            }}
          >
            Phát từ đầu
          </button>
        </div>
      </div>

      <div className="queue-list">
        {queue.map((song, i) => (
          <div key={song.song_id || song.id} className="queue-item-wrapper">
            <SongListItem
              song={song}
              onPlay={() => playSong(song)}
              onAddToQueue={() => addToQueue(song)}
              isActive={i === currentIndex}
            />
            <div className="queue-item-controls">
              <button
                className="btn-link remove-btn"
                onClick={() => removeFromQueue(song.song_id || song.id)}
                aria-label="Xóa khỏi hàng đợi"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Queue;
