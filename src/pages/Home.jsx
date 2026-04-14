import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Dùng để chuyển trang
import { AuthContext } from "../context/AuthContext";
import { songAPI } from "../services/api";
import { PlayerContext } from "../context/PlayerContext";
import { Play } from "lucide-react";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate(); // Khởi tạo hook chuyển hướng
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

  // --- HÀM XỬ LÝ CLICK QUẢNG CÁO (TRACKING & REDIRECT) ---
  const handleAdClick = async (ad) => {
    if (!ad) return;

    try {
      // 1. Gọi API ghi nhận lượt click (Chạy ngầm không cần await để tránh lag UI)
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/api/ads/${ad.ad_id}/impression`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Phải có token vì route cần authenticate
        },
        body: JSON.stringify({ is_clicked: true }),
      });
    } catch (error) {
      console.error("Lỗi track quảng cáo:", error);
    }

    // 2. Chuyển hướng người dùng đến trang đích
    if (ad.target_url) {
      if (ad.target_url.startsWith("http")) {
        // Nếu là link ngoài (vd: https://google.com) thì mở tab mới
        window.open(ad.target_url, "_blank");
      } else {
        // Nếu là link nội bộ (vd: /dashboard) thì chuyển trang
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

  // Hàm render từng mục nhạc
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
          <p>{song.artist?.name}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="home-container" style={{ padding: "30px" }}>
      {/* --- BANNER QUẢNG CÁO ĐỘNG TỪ DB --- */}
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
            style={{
              padding: "12px 24px",
              borderRadius: "30px",
              background: "white",
              color: "black",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          >
            Tìm hiểu thêm
          </button>
        </div>
      )}

      {/* --- CÁC DANH MÁCH BÀI HÁT --- */}
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

      <section style={{ marginTop: "40px" }}>
        <h2
          className="section-title"
          style={{ color: "white", marginBottom: "20px" }}
        >
          Dành riêng cho bạn
        </h2>
        {data.recommended?.length > 0 ? (
          renderSongGrid(data.recommended)
        ) : (
          <p style={{ color: "#b3b3b3" }}>Chưa có dữ liệu</p>
        )}
      </section>
    </div>
  );
};

export default Home;
