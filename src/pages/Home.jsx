import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { Play } from "lucide-react";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { playSong } = useContext(PlayerContext);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await songAPI.getHome();
        if (res.success) setData(res.data);
      } catch (err) {
        console.error("Lỗi tải Home:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHome();
  }, []);

  if (isLoading) return <div className="loading">Đang tải...</div>;
  if (!data) return <div className="no-data">Không có dữ liệu</div>;

  // Hàm render từng mục nhạc để dùng lại
  const renderSongGrid = (songs) => (
    <div className="song-grid">
      {songs.map((song) => (
        <div
          key={song.song_id}
          className="song-card"
          onClick={() => playSong(song)}
        >
          <div className="song-cover-wrapper">
            <img src={song.cover_url} alt={song.title} />
            <button className="btn-play-overlay">
              <Play size={24} fill="black" />
            </button>
          </div>
          <h4>{song.title}</h4>
          <p>{song.artist?.name}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="home-container">
      {user?.plan === "free" && (
        <div className="ad-banner">
          <div>
            <h3>Nâng cấp gói Premium</h3>
            <p>Nghe nhạc không quảng cáo và chất lượng âm thanh cao hơn.</p>
          </div>
          <button className="btn-upgrade">Nâng cấp ngay</button>
        </div>
      )}

      <section>
        <h2 className="section-title">Trending</h2>
        {renderSongGrid(data.trending)}
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2 className="section-title">Mới phát hành</h2>
        {renderSongGrid(data.new_releases)}
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2 className="section-title">Dành riêng cho bạn</h2>
        {renderSongGrid(data.recommended)}
      </section>
    </div>
  );
};

export default Home;
