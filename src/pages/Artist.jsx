// src/pages/Artist.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { artistAPI, songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import {
  Play,
  MoreHorizontal,
  Plus,
  BadgeCheck,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./Artist.css";

const Artist = () => {
  const { id } = useParams();

  const playerContext = useContext(PlayerContext);
  const { addToQueue } = playerContext || {};

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      try {
        const res = await artistAPI.getArtistById(id);
        if (res?.success) {
          setArtist(res.data);
          setIsFollowing(res.data.is_following || false);
          setFollowerCount(res.data.follower_count || 0);
        }
      } catch (err) {
        console.error("Lỗi khi fetch artist:", err);
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
        if (res?.success && res.data) playSong(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      playSong(song);
    }
  };

  const handleAddToQueue = (song) => {
    if (addToQueue && song) addToQueue(song);
  };

  // TOGGLE FOLLOW
  const handleToggleFollow = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);

    try {
      const res = await artistAPI.toggleFollow(id);
      if (res?.success) {
        const newIsFollowing = res.data.is_following;
        const newCount = res.data.follower_count;

        setIsFollowing(newIsFollowing);
        setFollowerCount(newCount);

        setArtist((prev) => ({
          ...prev,
          is_following: newIsFollowing,
          follower_count: newCount,
        }));
      }
    } catch (err) {
      console.error("Lỗi follow/unfollow:", err);
      alert("Có lỗi xảy ra khi theo dõi nghệ sĩ");
    } finally {
      setIsFollowLoading(false);
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
            {followerCount.toLocaleString()} người theo dõi
          </p>

          {/* NÚT FOLLOW */}
          <button
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
            className={`follow-btn ${isFollowing ? "following" : ""}`}
            style={{
              marginTop: "15px",
              padding: "10px 28px",
              borderRadius: "9999px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: isFollowLoading ? "not-allowed" : "pointer",
              opacity: isFollowLoading ? 0.7 : 1,
            }}
          >
            {isFollowLoading ? (
              "Đang xử lý..."
            ) : isFollowing ? (
              <>
                <UserCheck size={18} style={{ marginRight: 6 }} /> Đang theo dõi
              </>
            ) : (
              <>
                <UserPlus size={18} style={{ marginRight: 6 }} /> Theo dõi
              </>
            )}
          </button>
        </div>
      </div>

      <div className="artist-content">
        <h2 className="artist-section-title">Phổ biến</h2>

        <div className="song-list">
          {songsList.map((song, index) => {
            const isThisPlaying =
              currentSong?.song_id === song.song_id && isPlaying;

            return (
              <div
                key={song.song_id}
                className="song-row"
                onClick={() => handlePlaySong(song)}
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
                  <span style={{ color: isThisPlaying ? "#1ed760" : "white" }}>
                    {song.title}
                  </span>
                </div>

                <div className="song-plays">
                  {song.play_count?.toLocaleString() || 0}
                </div>

                <div className="song-actions">
                  <span style={{ color: "#9ca3af" }}>
                    {song.duration_formatted}
                  </span>

                  <button
                    className="queue-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToQueue(song);
                    }}
                    title="Thêm vào hàng đợi"
                  >
                    <Plus size={20} />
                  </button>

                  <button
                    className="more-btn"
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
