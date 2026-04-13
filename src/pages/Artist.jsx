import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { artistAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Heart, MoreHorizontal, BadgeCheck } from "lucide-react";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./Artist.css";

const Artist = () => {
  const { id } = useParams();
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [artist, setArtist] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await artistAPI.getArtistById(id);
        if (res && res.success) setArtist(res.data);
        else {
          console.warn("Artist API trả về không thành công:", res);
          setArtist(null);
        }
      } catch (err) {
        console.error("Lỗi khi fetch artist:", err);
        setArtist(null);
      }
    };
    fetchArtist();
  }, [id]);

  if (!artist) return <div className="p-10 text-white">Đang tải...</div>;

  return (
    <div className="artist-container">
      <div
        className="artist-header"
        style={{ backgroundImage: `url(${artist.banner_url})` }}
      >
        <div className="artist-header-overlay"></div>
        <div className="artist-info">
          <span>
            <BadgeCheck size={20} fill="#10b981" color="white" /> Nghệ sĩ đã xác
            minh
          </span>
          <h1>{artist.name}</h1>
          <p className="artist-stats">
            {artist.monthly_listeners?.toLocaleString()} người nghe hàng tháng
          </p>
        </div>
      </div>

      <div className="artist-content">
        <h2 className="artist-section-title">Phổ biến</h2>
        <div className="song-list">
          {artist.top_songs?.map((song, index) => (
            <div
              key={song.song_id}
              className="song-row"
              onDoubleClick={() => playSong && playSong(song)}
            >
              <div className="song-index">{index + 1}</div>

              <div className="song-main">
                <img src={song.cover_url} alt="cover" />
                <span
                  className={
                    currentSong?.song_id === song.song_id && isPlaying
                      ? "text-green"
                      : ""
                  }
                >
                  {song.title}
                </span>
              </div>

              <div className="song-plays">
                {song.play_count?.toLocaleString()}
              </div>

              <div className="song-meta">
                <span>{song.duration_formatted}</span>
                <button onClick={() => setSelectedSong(song)}>
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={!!selectedSong}
        onClose={() => setSelectedSong(null)}
        song={selectedSong}
      />
    </div>
  );
};

export default Artist;
