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
              const extraRes = await songAPI.getSongs({ page: 1, limit: 10 });
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
      await fetch(`http://localhost:5000/api/ads/${ad.ad_id}/impression`, {
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

  const handleUpgradeClick = () => {
    navigate("/profile");
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

  const fallbackColors = [
    "#E13300",
    "#1E3264",
    "#E8115B",
    "#148A08",
    "#BC5900",
    "#509BF5",
    "#8D67AB",
    "#7358FF",
  ];

  const renderGenreGrid = (genres) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "20px",
      }}
    >
      {genres?.map((genre, index) => (
        <div
          key={genre.genre_id || genre.id || index}
          onClick={() => navigate(`/genre/${genre.genre_id || genre.id}`)}
          style={{
            backgroundColor:
              genre.color || fallbackColors[index % fallbackColors.length],
            borderRadius: "8px",
            padding: "16px",
            height: "100px",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              color: "white",
              margin: 0,
              fontSize: "20px",
              fontWeight: "bold",
              zIndex: 2,
              position: "relative",
            }}
          >
            {genre.name}
          </h3>
          {(genre.image_url || genre.cover_url) && (
            <img
              src={genre.image_url || genre.cover_url}
              alt={genre.name}
              style={{
                position: "absolute",
                bottom: "-10px",
                right: "-10px",
                width: "80px",
                height: "80px",
                transform: "rotate(25deg)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                borderRadius: "4px",
              }}
            />
          )}
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

          <button
            className="btn-upgrade"
            onClick={(e) => {
              e.stopPropagation();
              handleUpgradeClick();
            }}
          >
            Tìm hiểu thêm
          </button>
        </div>
      )}

      {/* Nghe gần đây */}
      {data.recent_played?.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h2
            className="section-title"
            style={{ color: "white", marginBottom: "20px" }}
          >
            Nghe gần đây
          </h2>
          {renderSongGrid(data.recent_played)}
        </section>
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

      {/* Thể loại phổ biến */}
      {data.popular_genres?.length > 0 && (
        <section style={{ marginTop: "40px" }}>
          <h2
            className="section-title"
            style={{ color: "white", marginBottom: "20px" }}
          >
            Thể loại phổ biến
          </h2>
          {renderGenreGrid(data.popular_genres)}
        </section>
      )}

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

      {/* Dành riêng cho bạn - chỉ hiển thị khi đã đăng nhập */}
      {user && (
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
      )}
    </div>
  );
};

export default Home;
