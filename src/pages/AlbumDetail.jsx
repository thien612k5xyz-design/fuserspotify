import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
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
        if (res?.success) {
          const data = res.data;
          const release_year = data.release_date
            ? new Date(data.release_date).getFullYear()
            : undefined;
          setAlbum({ ...data, release_year });
        }
      } catch (err) {
        console.error("Fetch album lỗi:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (!album?.songs?.length) return;
    setQueueAndPlay(album.songs, 0);
  };

  const handlePlaySong = async (song) => {
    if (!song?.song_id) return;
    try {
      const res = await songAPI.getSongById(song.song_id);
      if (res?.success && res.data) {
        playSong(res.data);
      } else {
        playSong(song);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết bài hát:", err);
      playSong(song);
    }
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
          <span>Album</span>
          <h1>{album.title}</h1>
          <div className="album-meta">
            <span className="album-artist-name">{album.artist?.name}</span>
            <span className="album-year-tracks">
              • {album.release_year ?? "—"} • {album.songs?.length ?? 0} bài hát
            </span>
          </div>
        </div>
      </div>

      <div className="album-content">
        {/* Nút Play*/}
        <div className="album-actions">
          <button className="btn-play-album" onClick={handlePlayAlbum}>
            <Play size={28} fill="currentColor" />
          </button>
        </div>

        <div className="album-song-list">
          {album.songs?.map((song, index) => {
            const isThisPlaying =
              currentSong?.song_id === song.song_id && isPlaying;

            return (
              <div
                key={song.song_id}
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
                  >
                    {song.title}
                  </div>
                  <div className="song-artist">{album.artist?.name}</div>
                </div>

                <div
                  className="song-actions"
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span>{song.duration_formatted}</span>

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
