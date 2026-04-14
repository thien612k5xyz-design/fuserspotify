import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { albumAPI } from "../services/api";
import { Play, MoreHorizontal } from "lucide-react";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import "./AlbumDetail.css";

const AlbumDetail = () => {
  const { id } = useParams();
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      setIsLoading(true);
      try {
        const res = await albumAPI.getAlbumById(id);
        if (res && res.success) {
          const data = res.data;

          const release_year =
            data.release_year ||
            (data.release_date
              ? new Date(data.release_date).getFullYear()
              : undefined);

          setAlbum({ ...data, release_year });
        } else {
          console.warn("Album API lỗi:", res);
          setAlbum(null);
        }
      } catch (err) {
        console.error("Fetch album lỗi:", err);
        setAlbum(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  if (isLoading)
    return <div className="p-10 text-white">Đang tải album...</div>;

  if (!album)
    return <div className="p-10 text-white">Không tìm thấy album.</div>;

  return (
    <div className="album-detail-container">
      {/* HEADER */}
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

      {/* CONTENT */}
      <div className="album-content">
        {/* PLAY ALBUM */}
        <div className="album-actions">
          <button
            className="btn-play-album"
            onClick={() =>
              album.songs?.length > 0 && playSong && playSong(album.songs[0])
            }
          >
            <Play size={28} fill="currentColor" />
          </button>
        </div>

        {/* SONG LIST */}
        <div className="album-song-list">
          {album.songs?.map((song, index) => {
            const isThisPlaying =
              currentSong?.song_id === song.song_id && isPlaying;

            return (
              <div key={song.song_id} className="album-song-row">
                {/* NUMBER / PLAY BUTTON */}
                <div className="song-number">
                  {isThisPlaying ? (
                    "▶"
                  ) : (
                    <button
                      className="play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong && playSong(song);
                      }}
                    >
                      ▶
                    </button>
                  )}
                </div>

                {/* TITLE */}
                <div className="song-title-group">
                  <div
                    className={`song-title ${isThisPlaying ? "playing" : ""}`}
                  >
                    {song.title}
                  </div>
                  <div className="song-artist">{album.artist?.name}</div>
                </div>

                {/* ACTIONS */}
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

      {/* MODAL */}
      <AddToPlaylistModal
        isOpen={!!selectedSong}
        onClose={() => setSelectedSong(null)}
        song={selectedSong}
      />
    </div>
  );
};

export default AlbumDetail;
