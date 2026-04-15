import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { albumAPI, songAPI } from "../services/api";
import { Play, MoreHorizontal, Plus } from "lucide-react";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./AlbumDetail.css";

const AlbumDetail = () => {
  const { id } = useParams();
  const { playSong, currentSong, isPlaying, addToQueue, setQueueAndPlay } =
    useContext(PlayerContext);

  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      setIsLoading(true);
      try {
        const res = await albumAPI.getAlbumById(id);
        const data = res?.success ? res.data : res;
        if (data) {
          const release_year = data.release_date
            ? new Date(data.release_date).getFullYear()
            : undefined;
          setAlbum({ ...data, release_year });
        } else {
          setAlbum(null);
        }
      } catch (err) {
        console.error("Fetch album lỗi:", err);
        setAlbum(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (!album?.songs?.length) return;
    setQueueAndPlay(album.songs, 0);
  };

  const handlePlaySong = async (song) => {
    if (!song) return;
    if (song.song_id) {
      try {
        const res = await songAPI.getSongById(song.song_id);
        const data = res?.success ? res.data : res;
        if (data) {
          playSong(data);
          return;
        }
      } catch (err) {
        console.warn("Không lấy được chi tiết bài hát, phát tạm:", err);
      }
    }
    playSong(song);
  };

  const handleAddToQueue = (song) => {
    if (addToQueue && song) addToQueue(song);
  };

  if (isLoading)
    return <div className="p-10 text-white">Đang tải album...</div>;
  if (!album)
    return <div className="p-10 text-white">Không tìm thấy album.</div>;

  return (
    <div className="album-detail-container">
      <div className="album-header">
        <img src={album.cover_url} alt="cover" className="album-cover" />

        <div className="album-info">
          <span className="album-type">Album</span>

          <h1 className="album-title">{album.title}</h1>

          {/* Use className "album-meta" to match CSS */}
          <div className="album-meta" style={{ marginTop: 8, width: "100%" }}>
            <Link
              to={`/artist/${album.artist?.artist_id || album.artist?.id || album.artist_id}`}
              className="album-artist-name"
              title={album.artist?.name || album.artist || ""}
              style={{
                maxWidth: "60%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
              }}
            >
              {album.artist?.name || album.artist || "Unknown Artist"}
            </Link>

            <span
              className="album-year-tracks"
              style={{ color: "#9ca3af", fontSize: "14px", flexShrink: 0 }}
            >
              • {album.release_year ?? "—"} • {album.songs?.length ?? 0} bài hát
            </span>
          </div>
        </div>
      </div>

      <div className="album-content">
        <div className="album-actions">
          <button
            className="btn-play-album"
            onClick={handlePlayAlbum}
            title="Phát toàn bộ album"
          >
            <Play size={28} fill="currentColor" />
          </button>
        </div>

        <div className="album-song-list">
          {album.songs?.map((song, index) => {
            const isThisPlaying =
              currentSong?.song_id === song.song_id && isPlaying;

            return (
              <div
                key={song.song_id || `${index}-${song.title}`}
                className={`album-song-row ${isThisPlaying ? "playing" : ""}`}
                onClick={() => handlePlaySong(song)}
              >
                <div className="song-number">
                  {isThisPlaying ? (
                    "▶"
                  ) : (
                    <span className="song-index">{index + 1}</span>
                  )}
                </div>

                <div className="song-title-group">
                  <div
                    className={`song-title ${isThisPlaying ? "playing" : ""}`}
                    style={{
                      maxWidth: "60ch",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {song.title}
                  </div>
                  <div className="song-artist" style={{ color: "#9ca3af" }}>
                    {album.artist?.name || album.artist || "Unknown Artist"}
                  </div>
                </div>

                <div
                  className="song-actions"
                  style={{ display: "flex", gap: "12px" }}
                >
                  <span
                    style={{ color: "#9ca3af", width: 60, textAlign: "right" }}
                  >
                    {song.duration_formatted}
                  </span>

                  <button
                    className="hover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToQueue(song);
                    }}
                    title="Thêm vào hàng đợi"
                  >
                    <Plus size={20} />
                  </button>

                  <button
                    className="hover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSong(song);
                    }}
                    title="Thêm vào playlist / Thao tác khác"
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

export default AlbumDetail;
