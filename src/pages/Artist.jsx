import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { artistAPI, songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { Play, MoreHorizontal, BadgeCheck } from "lucide-react";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./Artist.css";

const Artist = () => {
  const { id } = useParams();

  const playerContext = useContext(PlayerContext);
  const storePlaySong =
    typeof usePlayerStore === "function"
      ? usePlayerStore((s) => s.playSong)
      : null;
  const currentSongStore =
    typeof usePlayerStore === "function"
      ? usePlayerStore((s) => s.currentSong)
      : null;
  const isPlayingStore =
    typeof usePlayerStore === "function"
      ? usePlayerStore((s) => s.isPlaying)
      : null;

  const playSong = playerContext?.playSong || storePlaySong;
  const currentSong = playerContext?.currentSong || currentSongStore;
  const isPlaying = playerContext?.isPlaying || isPlayingStore;

  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      try {
        const res = await artistAPI.getArtistById(id);
        if (res && res.success) {
          setArtist(res.data);
        } else {
          setArtist(null);
        }
      } catch (err) {
        console.error("Lỗi khi fetch artist:", err);
        setArtist(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const handlePlaySong = async (song) => {
    if (!playSong) return;

    if (!song.file_url) {
      try {
        const res = await songAPI.getSongById(song.song_id);
        if (res.success && res.data) {
          playSong(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy link nhạc:", err);
      }
    } else {
      playSong(song);
    }
  };

  if (isLoading)
    return <div className="p-10 text-white">Đang tải nghệ sĩ...</div>;
  if (!artist)
    return <div className="p-10 text-white">Không tìm thấy nghệ sĩ.</div>;

  const songsList = artist.top_songs || artist.songs || [];

  return (
    <div className="artist-container">
      {/* HEADER NGHỆ SĨ */}
      <div
        className="artist-header"
        style={{
          backgroundImage: `url(${artist.banner_url || artist.image_url})`,
        }}
      >
        <div className="artist-header-overlay"></div>
        <div className="artist-info">
          <span>
            <BadgeCheck size={20} fill="#10b981" color="white" /> Nghệ sĩ đã xác
            minh
          </span>
          <h1>{artist.name}</h1>
          <p className="artist-stats">
            {artist.monthly_listeners?.toLocaleString() ||
              artist.followers_count?.toLocaleString() ||
              0}{" "}
            người nghe hàng tháng
          </p>
        </div>
      </div>

      <div className="artist-content">
        <h2 className="artist-section-title">Phổ biến</h2>

        {/* DANH SÁCH BÀI HÁT */}
        <div className="song-list">
          {songsList.map((song, index) => {
            const isThisPlaying =
              currentSong?.song_id === song.song_id && isPlaying;
            return (
              <div
                key={song.song_id}
                className="song-row"
                onClick={() => handlePlaySong(song)}
                style={{ cursor: "pointer" }}
              >
                <div className="song-index">
                  {isThisPlaying ? (
                    <span style={{ color: "#1ed760" }}>▶</span>
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="song-main">
                  <img src={song.cover_url} alt="cover" />
                  <span
                    className={isThisPlaying ? "text-green" : ""}
                    style={{ color: isThisPlaying ? "#1ed760" : "white" }}
                  >
                    {song.title}
                  </span>
                </div>

                <div className="song-plays">
                  {song.play_count?.toLocaleString()}
                </div>

                <div className="song-actions">
                  <span>{song.duration_formatted}</span>
                  <button
                    className="hover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSong(song);
                    }}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            );
          })}
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
