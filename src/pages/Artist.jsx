import React from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Heart, MoreHorizontal, BadgeCheck } from "lucide-react";
import "./Artist.css";

const Artist = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const artistInfo = {
    id: 1,
    name: "Sơn Tùng M-TP",
    monthlyListeners: "1,250,432",
    bannerUrl:
      "https://i.scdn.co/image/ab676186000010168b919d3fbc9118eab318f773",
  };

  const topSongs = [
    {
      id: "10",
      title: "Chúng Ta Của Tương Lai",
      artist: "Sơn Tùng M-TP",
      album: "Single",
      duration: "3:50",
      plays: "15,000,000",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273b4d8d1eec39d5718eb2c1402",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "11",
      title: "Có Chắc Yêu Là Đây",
      artist: "Sơn Tùng M-TP",
      album: "Single",
      duration: "3:22",
      plays: "42,100,500",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273a5a828e1c6674eb8d9d5926b",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },

  ];

  return (
    <div className="artist-container">
      <div
        className="artist-header"
        style={{ backgroundImage: `url(${artistInfo.bannerUrl})` }}
      >
        <div className="artist-header-overlay"></div>
        <div className="artist-info">
          <span>
            <BadgeCheck size={20} fill="#10b981" color="white" /> Nghệ sĩ đã xác
            minh
          </span>
          <h1>{artistInfo.name}</h1>
          <p className="artist-stats">
            {artistInfo.monthlyListeners} người nghe hàng tháng
          </p>
        </div>
      </div>

      <div className="artist-actions">
        <button
          className="play-all-btn"
          onClick={() => topSongs.length > 0 && playSong(topSongs[0])}
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
      </div>

      <div className="artist-content">
        <h2 className="artist-section-title">Phổ biến</h2>

        <div>
          {topSongs.map((song, index) => {
            const isThisSongPlaying = currentSong?.id === song.id && isPlaying;

            return (
              <div
                key={song.id}
                className="song-row"
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
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <img src={song.coverUrl} alt="cover" />
                  <div
                    style={{
                      color: isThisSongPlaying ? "#10b981" : "white",
                      fontWeight: "bold",
                    }}
                  >
                    {song.title}
                  </div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  {song.plays}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1rem",
                    color: "#9ca3af",
                  }}
                >
                  <Heart
                    size={18}
                    className="cursor-pointer hover:text-white"
                  />
                  <span>{song.duration}</span>
                  <MoreHorizontal
                    size={20}
                    className="cursor-pointer hover:text-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Artist;
