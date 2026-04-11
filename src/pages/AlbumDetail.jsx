import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
import "./AlbumDetail.css";

const AlbumDetail = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [isAlbumLiked, setIsAlbumLiked] = useState(false);

  const albumInfo = {
    id: 1,
    title: "Divide",
    artist: "Ed Sheeran",
    releaseYear: 2017,
    coverUrl:
      "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    totalDuration: "46:14",
  };

  const albumSongs = [
    {
      id: "1",
      track_number: 1,
      title: "Eraser",
      artist: "Ed Sheeran",
      album: "Divide",
      duration: "3:47",
      coverUrl: albumInfo.coverUrl,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "2",
      track_number: 2,
      title: "Castle on the Hill",
      artist: "Ed Sheeran",
      album: "Divide",
      duration: "4:21",
      coverUrl: albumInfo.coverUrl,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "3",
      track_number: 3,
      title: "Shape of You",
      artist: "Ed Sheeran",
      album: "Divide",
      duration: "3:53",
      coverUrl: albumInfo.coverUrl,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      id: "4",
      track_number: 4,
      title: "Perfect",
      artist: "Ed Sheeran",
      album: "Divide",
      duration: "4:23",
      coverUrl: albumInfo.coverUrl,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
  ];

  return (
    <div className="album-detail-container">
      {/* 1. Header Album */}
      <div className="album-header">
        <img
          src={albumInfo.coverUrl}
          alt="album cover"
          className="album-cover"
        />
        <div className="album-info">
          <span>Album</span>
          <h1>{albumInfo.title}</h1>
          <div className="album-meta">
            <span className="album-artist-name">{albumInfo.artist}</span>
            <span className="album-year-tracks">
              • {albumInfo.releaseYear} • {albumSongs.length} bài hát,{" "}
              {albumInfo.totalDuration}
            </span>
          </div>
        </div>
      </div>

      {/*nút thao tác */}
      <div className="album-content">
        <div className="album-actions">
          <button
            className="btn-play-album"
            onClick={() => albumSongs.length > 0 && playSong(albumSongs[0])}
            title="Phát tất cả"
          >
            <Play size={28} fill="currentColor" className="ml-1" />
          </button>

          <button
            className="btn-icon-action"
            onClick={() => setIsAlbumLiked(!isAlbumLiked)}
            title="Lưu vào Thư viện"
          >
            <Heart
              size={32}
              fill={isAlbumLiked ? "#10b981" : "none"}
              color={isAlbumLiked ? "#10b981" : "currentColor"}
            />
          </button>

          <button className="btn-icon-action">
            <MoreHorizontal size={32} />
          </button>
        </div>

        {/*danh sách bài hát */}
        <div
          className="album-song-row"
          style={{
            borderBottom: "1px solid #1f2937",
            color: "#9ca3af",
            marginBottom: "1rem",
            cursor: "default",
          }}
        >
          <div style={{ textAlign: "center" }}>#</div>
          <div>Tiêu đề</div>
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

        {/*danh sách */}
        <div>
          {albumSongs.map((song) => {
            const isThisSongPlaying = currentSong?.id === song.id && isPlaying;

            return (
              <div
                key={song.id}
                className="album-song-row"
                onDoubleClick={() => playSong(song)}
              >
                <div className="song-number">
                  <span
                    className="song-number-text"
                    style={{
                      color: isThisSongPlaying ? "#10b981" : "",
                      fontWeight: isThisSongPlaying ? "bold" : "",
                    }}
                  >
                    {isThisSongPlaying ? "▶" : song.track_number}
                  </span>
                  <button
                    className="hover-play"
                    style={{ display: "none" }}
                    onClick={() => playSong(song)}
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>

                <div className="song-title-group">
                  <div
                    className={`song-title ${isThisSongPlaying ? "playing" : ""}`}
                  >
                    {song.title}
                  </div>
                  <div className="song-artist">{song.artist}</div>
                </div>

                <div className="song-actions">
                  <button
                    className="hover-btn"
                    title="Lưu vào Bài hát đã thích"
                  >
                    <Heart size={18} />
                  </button>
                  <span>{song.duration}</span>
                  <button className="hover-btn" title="Thêm">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
