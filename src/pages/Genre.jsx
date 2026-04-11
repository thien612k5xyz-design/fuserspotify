import React, { useState, useEffect } from "react";
import { songAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Clock, ChevronLeft, Music } from "lucide-react";
import "./Genre.css";

const Genre = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [songs, setSongs] = useState([]);

  // Tải danh sách thể loại từ API
  useEffect(() => {
    const fetchGenres = async () => {
      const res = await songAPI.getGenres();
      if (res.success) setGenres(res.data);
    };
    fetchGenres();
  }, []);

  // Tải bài hát khi chọn một thể loại
  const handleSelectGenre = async (genre) => {
    setSelectedGenre(genre);
    const res = await songAPI.getSongsByGenre(genre.genre_id);
    if (res.success) setSongs(res.data);
  };

  return (
    <div className="genre-container">
      {!selectedGenre ? (
        <>
          <h1 className="genre-title">Duyệt tìm Thể loại</h1> [cite: 464]
          <div className="genre-grid">
            {genres.map((genre) => (
              <div
                key={genre.genre_id}
                className="genre-card"
                style={{ backgroundColor: genre.color_code || "#282828" }}
                onClick={() => handleSelectGenre(genre)}
              >
                <div className="genre-name">{genre.name}</div>
                <Music className="genre-bg-icon" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="genre-detail-header">
            <button className="btn-back" onClick={() => setSelectedGenre(null)}>
              <ChevronLeft size={28} />
            </button>
            <h1 className="genre-title">
              Thể loại: <span className="text-green">{selectedGenre.name}</span>
            </h1>{" "}
            [cite: 492]
          </div>
          <div className="song-list-container">
            {songs.map((song, index) => (
              <div
                key={song.song_id}
                className="genre-song-row"
                onDoubleClick={() => playSong(song)}
              >
                <div className="song-index">{index + 1}</div>
                <div className="song-info-group">
                  <img src={song.cover_url} alt="cover" />
                  <div>
                    <div
                      className={
                        currentSong?.song_id === song.song_id && isPlaying
                          ? "text-green"
                          : ""
                      }
                    >
                      {song.title}
                    </div>
                    <div className="artist-sub">{song.artist?.name}</div>
                  </div>
                </div>
                <div className="song-duration">{song.duration_formatted}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Genre;
