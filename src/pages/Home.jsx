import React, { useState, useEffect, useContext } from "react";
import { songAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Play, Flame, Music, Crown } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { playSong } = usePlayerStore();

  const [genres, setGenres] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [genreRes, songRes] = await Promise.all([
          songAPI.getGenres(),
          songAPI.getSongs(),
        ]);
        if (genreRes.success) setGenres(genreRes.data);
        if (songRes.success) setSongs(songRes.data);
      } catch (error) {
        console.error("Lỗi tải Home:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Lấy bài hát đầu tiên làm Banner Trending
  const trendingSong = songs.length > 0 ? songs[0] : null;

  if (isLoading)
    return (
      <div className="loading" style={{ color: "white", padding: "50px" }}>
        Giai điệu đang đến... 🎵
      </div>
    );

  return (
    <div className="home-container">
      {/* 1. Banner Nâng cấp (Chỉ hiện khi user là 'free') */}
      {user?.plan === "free" && (
        <div className="ad-banner">
          <div>
            <h3>Nâng cấp gói Premium</h3>
            <p>Nghe nhạc không quảng cáo và chất lượng cao hơn ngay hôm nay.</p>
          </div>
          <button className="btn-upgrade">Nâng cấp ngay</button>
        </div>
      )}

      {/* 2. Danh sách Thể loại (Dạng trượt ngang) */}
      <div className="section-title">Khám phá thể loại</div>
      <div className="genre-list">
        {genres.map((g) => (
          <button key={g.genre_id} className="genre-btn">
            {g.name}
          </button>
        ))}
      </div>

      {/* 3. Banner Trending rực rỡ */}
      {trendingSong && (
        <div className="trending-banner">
          <img src={trendingSong.cover_url} alt="Trending" />
          <div className="trending-overlay"></div>
          <div className="trending-content">
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#10b981",
                fontWeight: "bold",
              }}
            >
              <Flame size={20} fill="#10b981" /> TRENDING NOW
            </span>
            <h1>{trendingSong.title}</h1>
            <button
              className="btn-play-primary"
              onClick={() => playSong(trendingSong)}
            >
              <Play size={20} fill="black" /> PHÁT NGAY
            </button>
          </div>
        </div>
      )}

      {/* 4. Lưới bài hát gợi ý */}
      <div className="section-title">Gợi ý cho bạn</div>
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
            <p>{song.artist?.name || "Nghệ sĩ"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
