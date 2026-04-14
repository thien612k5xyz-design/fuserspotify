import React from "react";
import { Play, Plus, MoreHorizontal } from "lucide-react";

/**
 * Props:
 * - song: object
 * - onPlay(song)
 * - onAddToQueue(song)
 * - onMore(song) optional
 * - isActive boolean
 */
const SongListItem = ({ song, onPlay, onAddToQueue, onMore, isActive }) => {
  return (
    <div className={`song-list-item ${isActive ? "active" : ""}`}>
      <div className="song-left">
        <img
          src={song.cover_url || song.coverUrl || "/default-cover.png"}
          alt={song.title}
          className="song-thumb"
        />
        <div className="song-meta">
          <div className="song-title">{song.title}</div>
          <div className="song-artist">
            {song.artist?.name || song.artist || "Unknown"}
          </div>
        </div>
      </div>

      <div className="song-actions">
        <button
          className="btn-icon play-btn"
          title="Phát"
          onClick={() => onPlay(song)}
        >
          <Play size={16} />
        </button>

        <button
          className="btn-icon add-btn"
          title="Thêm vào hàng đợi"
          onClick={() => onAddToQueue(song)}
        >
          <Plus size={16} />
        </button>

        {onMore && (
          <button
            className="btn-icon more-btn"
            title="Thêm tuỳ chọn"
            onClick={() => onMore(song)}
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SongListItem;
