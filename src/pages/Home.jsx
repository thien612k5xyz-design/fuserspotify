import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { Play } from "lucide-react";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedSongs, setRecommendedSongs] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const homeRes = await songAPI.getHome();

        if (homeRes.success) {
          let homeData = homeRes.data;

          if (!homeData.recommended || homeData.recommended.length < 5) {
            try {
              const extraRes = await songAPI.getSongs({
                page: 1,
                limit: 10,
              });

              if (extraRes.success && extraRes.data) {
                const existingIds = new Set(
                  homeData.recommended?.map((s) => s.song_id) || [],
                );

                const extra = extraRes.data
                  .filter((song) => !existingIds.has(song.song_id))
                  .slice(0, 8);

                homeData.recommended = [
                  ...(homeData.recommended || []),
                  ...extra,
                ].slice(0, 8);
              }
            } catch (extraErr) {
              console.warn(
                "Không thể tải bài bổ sung cho Recommended:",
                extraErr,
              );
            }
          }

          setData(homeData);
          setRecommendedSongs(homeData.recommended || []);
        }
      } catch (err) {
        console.error("Lỗi tải Home:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleAdClick = async (ad) => {
    if (!ad) return;

    try {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/api/ads/${ad.ad_id}/impression`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_clicked: true }),
      });
    } catch (error) {
      console.error("Lỗi track quảng cáo:", error);
    }

    if (ad.target_url) {
      if (ad.target_url.startsWith("http")) {
        window.open(ad.target_url, "_blank");
      } else {
        navigate(ad.target_url);
      }
    }
  };

  if (isLoading)
    return (
      <div className="loading" style={{ color: "white", padding: "20px" }}>
        Đang tải...
      </div>
    );

  if (!data)
    return (
      <div className="no-data" style={{ color: "white", padding: "20px" }}>
        Không có dữ liệu
      </div>
    );

  const renderSongGrid = (songs) => (
    <div className="song-grid">
      {songs?.map((song) => (
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
          <p>{song.artist?.name || "Unknown"}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="home-container" style={{ padding: "30px" }}>
      {/* Banner Quảng cáo */}
      {user?.plan === "free" && data.current_ad && (
        <div
          className="ad-banner"
          onClick={() => handleAdClick(data.current_ad)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "20px",
            background: "linear-gradient(90deg, #1db954, #191414)",
            borderRadius: "12px",
            cursor: "pointer",
            marginBottom: "40px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          <img
            src={data.current_ad.image_url}
            alt="Ad Cover"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "8px",
              objectFit: "cover",
              border: "2px solid white",
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: "0 0 5px 0",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Tài trợ
            </p>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "white",
                fontSize: "24px",
                fontWeight: "900",
              }}
            >
              {data.current_ad.title}
            </h3>
            <p style={{ margin: 0, color: "#b3b3b3", fontSize: "14px" }}>
              Nâng cấp ngay để trải nghiệm âm nhạc không giới hạn.
            </p>
          </div>
          <button className="btn-upgrade">Tìm hiểu thêm</button>
        </div>
      )}

      {/* Trending */}
      <section>
        <h2
          className="section-title"
          style={{ color: "white", marginBottom: "20px" }}
        >
          Trending
        </h2>
        {data.trending?.length > 0 ? (
          renderSongGrid(data.trending)
        ) : (
          <p style={{ color: "#b3b3b3" }}>Chưa có dữ liệu</p>
        )}
      </section>

      {/* Mới phát hành */}
      <section style={{ marginTop: "40px" }}>
        <h2
          className="section-title"
          style={{ color: "white", marginBottom: "20px" }}
        >
          Mới phát hành
        </h2>
        {data.new_releases?.length > 0 ? (
          renderSongGrid(data.new_releases)
        ) : (
          <p style={{ color: "#b3b3b3" }}>Chưa có dữ liệu</p>
        )}
      </section>

      {/* DÀNH RIÊNG CHO BẠN */}
      <section style={{ marginTop: "40px" }}>
        <h2
          className="section-title"
          style={{ color: "white", marginBottom: "20px" }}
        >
          Dành riêng cho bạn
        </h2>
        {recommendedSongs.length > 0 ? (
          renderSongGrid(recommendedSongs)
        ) : (
          <p style={{ color: "#b3b3b3" }}>Chưa có dữ liệu gợi ý</p>
        )}
      </section>
    </div>
  );
};

export default Home;
