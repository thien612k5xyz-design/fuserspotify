import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Heart, Clock, ChevronLeft, Music } from "lucide-react";
import "./Genre.css";

const Genre = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const genres = [
    {
      id: 1,
      name: "Pop",
      songCount: 85,
      color: "linear-gradient(135deg, #ec4899, #be185d)",
    },
    {
      id: 2,
      name: "Rock",
      songCount: 62,
      color: "linear-gradient(135deg, #ef4444, #b91c1c)",
    },
    {
      id: 3,
      name: "Hip-Hop",
      songCount: 45,
      color: "linear-gradient(135deg, #f97316, #c2410c)",
    },
    {
      id: 4,
      name: "EDM",
      songCount: 120,
      color: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
  ];

  const genreSongs = [
    {
      id: "20",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273881d8d8378cd01099baa7773",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "21",
      title: "Save Your Tears",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:35",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273881d8d8378cd01099baa7773",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
  ];

  return (
    <div className="genre-container">
      {!selectedGenre ? (
        <>
          <h1 className="genre-title">Duyệt tìm Thể loại</h1>
          <div className="genre-grid">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="genre-card"
                style={{ background: genre.color }}
                onClick={() => setSelectedGenre(genre)}
              >
                <div className="genre-name">{genre.name}</div>
                <div className="genre-count">{genre.songCount} bài hát</div>
                <Music className="genre-bg-icon" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="genre-detail-header">
            <button
              className="btn-back"
              onClick={() => setSelectedGenre(null)}
              title="Quay lại"
            >
              <ChevronLeft size={28} />
            </button>
            <h1 className="genre-title" style={{ marginBottom: 0 }}>
              Thể loại:{" "}
              <span style={{ color: "#10b981" }}>{selectedGenre.name}</span>
            </h1>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn-play-genre"
              onClick={() => playSong(genreSongs[0])}
            >
              <Play size={20} fill="currentColor" /> Phát ngẫu nhiên
            </button>
          </div>

          <div
            className="genre-song-row"
            style={{
              borderBottom: "1px solid #1f2937",
              color: "#9ca3af",
              marginBottom: "1rem",
              cursor: "default",
            }}
          >
            <div style={{ textAlign: "center" }}>#</div>
            <div>Tiêu đề</div>
            <div>Album</div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: "1rem",
              }}
            >
              <Clock size={16} />
            </div>
          </div>

          <div>
            {genreSongs.map((song, index) => {
              const isThisSongPlaying =
                currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={song.id}
                  className="genre-song-row"
                  onDoubleClick={() => playSong(song)}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: isThisSongPlaying ? "#10b981" : "#9ca3af",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <img src={song.coverUrl} alt="cover" />
                    <div>
                      <div
                        style={{
                          color: isThisSongPlaying ? "#10b981" : "white",
                          fontWeight: "bold",
                        }}
                      >
                        {song.title}
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                        {song.artist}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    {song.album}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "1.5rem",
                      color: "#10b981",
                      paddingRight: "1rem",
                    }}
                  >
                    <Heart
                      size={18}
                      className="cursor-pointer hover:scale-110 transition-transform"
                    />
                    <span style={{ color: "#9ca3af" }}>{song.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Genre;
