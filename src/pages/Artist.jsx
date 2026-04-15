import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { artistAPI, songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import {
  BadgeCheck,
  UserPlus,
  UserCheck,
  Play,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./Artist.css";

const Artist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerContext = useContext(PlayerContext);
  const { playSong, currentSong, isPlaying, addToQueue } = playerContext || {};

  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      try {
        const res = await artistAPI.getArtistById(id);
        if (res?.success) {
          setArtist(res.data);
          setIsFollowing(res.data.is_following || false);
          setFollowerCount(res.data.follower_count || 0);

          // 1. Lấy danh sách bài hát
          const fetchedSongs = res.data.top_songs || res.data.songs || [];
          setSongs(fetchedSongs);
          let fetchedAlbums = [];
          if (res.data.albums && res.data.albums.length > 0) {
            fetchedAlbums = res.data.albums;
          } else if (fetchedSongs.length > 0) {
            const albumMap = new Map();
            fetchedSongs.forEach((song) => {
              const albumId = song.album_id || song.album?.id;
              if (albumId && !albumMap.has(albumId)) {
                albumMap.set(albumId, {
                  id: albumId,
                  album_id: albumId,
                  title:
                    song.album?.title || song.album_name || "Unknown Album",
                  cover_url: song.album?.cover_url || song.cover_url,
                  release_year: song.album?.release_year || null,
                });
              }
            });
            fetchedAlbums = Array.from(albumMap.values());
          }

          if (
            fetchedAlbums.length === 0 &&
            typeof artistAPI.getArtistAlbums === "function"
          ) {
            try {
              const albumRes = await artistAPI.getArtistAlbums(id);
              if (albumRes?.success) {
                fetchedAlbums = albumRes.data?.data || albumRes.data || [];
              }
            } catch (e) {}
          }
          setAlbums(fetchedAlbums);
        }
      } catch (err) {
        console.error("Fetch artist error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const handleToggleFollow = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const res = await artistAPI.toggleFollow(id);
      if (res?.success) {
        setIsFollowing(res.data.is_following);
        setFollowerCount(res.data.follower_count);
        setArtist((prev) => ({
          ...prev,
          is_following: res.data.is_following,
          follower_count: res.data.follower_count,
        }));
      }
    } catch (err) {
      console.error("Lỗi follow:", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

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

  if (isLoading)
    return <div className="p-10 text-white">Đang tải nghệ sĩ...</div>;
  if (!artist)
    return <div className="p-10 text-white">Không tìm thấy nghệ sĩ.</div>;

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
          <h1
            style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0" }}
          >
            {artist.name}
          </h1>
          <p className="artist-stats">
            {followerCount.toLocaleString()} người theo dõi
          </p>
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

      <div className="artist-content" style={{ padding: "30px" }}>
        {/* PHẦN 1: ALBUMS */}
        <h2 style={{ color: "white", marginBottom: "20px" }}>Album</h2>
        {albums.length === 0 ? (
          <p style={{ color: "#b3b3b3", marginBottom: "40px" }}>
            Nghệ sĩ này chưa có album riêng.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "24px",
              marginBottom: "50px",
            }}
          >
            {albums.map((album) => (
              <div
                key={album.album_id || album.id}
                onClick={() => navigate(`/album/${album.album_id || album.id}`)}
                style={{
                  background: "#181818",
                  padding: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#282828")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#181818")
                }
              >
                <img
                  src={album.cover_url}
                  alt={album.title}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                />
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {album.title}
                </div>
                <div
                  style={{
                    color: "#b3b3b3",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {album.release_year ||
                    (album.release_date
                      ? new Date(album.release_date).getFullYear()
                      : "Album")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PHẦN 2: BÀI HÁT */}
        <h2 style={{ color: "white", marginBottom: "20px" }}>Phổ biến</h2>
        {songs.length === 0 ? (
          <p style={{ color: "#b3b3b3" }}>Chưa có bài hát nào.</p>
        ) : (
          <div className="song-list">
            {songs.map((song, index) => {
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
                      <span style={{ color: "#1ed760" }}> ▶ </span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="song-main">
                    <img src={song.cover_url} alt="cover" />
                    <span
                      style={{ color: isThisPlaying ? "#1ed760" : "white" }}
                    >
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
        )}
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
