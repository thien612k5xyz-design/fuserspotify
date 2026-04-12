import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { songAPI } from "../services/api";
import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
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
      try {
        const res = await songAPI.getAlbumById(id);
        if (res.success) setAlbum(res.data);
      } catch (err) {
        console.error(err);
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
      <div className="album-header">
        <img src={album.cover_url} alt="cover" className="album-cover" />
        <div className="album-info">
          <span>Album</span>
          <h1>{album.title}</h1>
          <div className="album-meta">
            <span className="album-artist-name">{album.artist?.name}</span>
            <span className="album-year-tracks">
              {" "}
              • {album.release_year} • {album.songs?.length} bài hát
            </span>{" "}
          </div>
        </div>
      </div>

      <div className="album-content">
        <div className="album-actions">
          <button
            className="btn-play-album"
            onClick={() => album.songs?.length > 0 && playSong(album.songs[0])}
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
                key={song.song_id}
                className="album-song-row"
                onDoubleClick={() => playSong(song)}
              >
                <div className="song-number">
                  {isThisPlaying ? "▶" : index + 1}
                </div>
                <div className="song-title-group">
                  <div
                    className={`song-title ${isThisPlaying ? "playing" : ""}`}
                  >
                    {song.title}
                  </div>
                  <div className="song-artist">{album.artist?.name}</div>
                </div>
                <div className="song-actions">
                  <span>{song.duration_formatted}</span>
                  <button
                    className="hover-btn"
                    onClick={() => setSelectedSong(song)}
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
