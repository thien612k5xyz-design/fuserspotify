import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, TrendingUp, Music, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const playSong = usePlayerStore((state) => state.playSong);
  const [isPremium] = useState(false);
  const navigate = useNavigate();
  const trendingSong = {
    id: "t1",
    title: "Shape of You",
    artist: "Ed Sheeran",
    coverUrl:
      "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  };
  const topSongs = [
    {
      id: "1",
      title: "light",
      artist: "wkd",
      coverUrl:
        "https://cdn.donmai.us/sample/64/30/__togawa_sakiko_arknights_and_2_more_drawn_by_yukuso_dabiandang__sample-643018782c88c017e3ad1bbbbfab4d98.jpg",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
  ];
  const genres = ["Pop", "Hip-Hop", "EDM", "K-Pop"];

  return (
    <div className="home-container">
      {!isPremium && (
        <div className="ad-banner">
          <div>
            <h3>Trải nghiệm âm nhạc không giới hạn!</h3>
          </div>
          <button className="btn-upgrade">Nâng cấp ngay</button>
        </div>
      )}

      <section>
        <h2 className="section-title">Đang thịnh hành</h2>
        <div className="trending-banner">
          <img src={trendingSong.coverUrl} alt="Banner" />
          <div className="trending-overlay"></div>
          <div className="trending-content">
            <h1>{trendingSong.title}</h1>
            <p className="text-lg text-gray-300 mb-4">{trendingSong.artist}</p>
            <button
              onClick={() => playSong(trendingSong)}
              className="btn-play-primary"
            >
              <Play size={20} fill="currentColor" /> Phát ngay
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Thể loại phổ biến</h2>
        <div className="genre-list scrollbar-hide">
          {genres.map((genre, index) => (
            <button
              key={index}
              className="genre-btn"
              onClick={() => navigate("/genre")}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Gợi ý cho bạn</h2>
        <div className="song-grid">
          {topSongs.map((song) => (
            <div key={song.id} className="song-card">
              <div className="song-cover-wrapper">
                <img src={song.coverUrl} alt={song.title} />
                <button
                  onClick={() => playSong(song)}
                  className="btn-play-overlay"
                >
                  <Play size={24} fill="currentColor" className="ml-1" />
                </button>
              </div>
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Home;
