// src/pages/UserDashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { Clock, Music, Trophy, Users } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // only month or year
  const COLORS = ["#1db954", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, genresRes] = await Promise.all([
          userAPI.getStats(period),
          userAPI.getGenreDistribution(period),
        ]);
        if (statsRes?.success) setStats(statsRes.data || statsRes);
        if (genresRes?.success) setGenreStats(genresRes.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [period]);

  if (isLoading) {
    return (
      <div style={{ padding: 60, color: "white", textAlign: "center" }}>
        Đang tải thống kê cá nhân...
      </div>
    );
  }

  // Safely extract summary values with fallbacks
  const summary = stats?.summary || {};
  const hours = summary.total_hours ?? stats?.total_hours ?? 0;
  const totalUnique =
    summary.total_unique_songs ?? stats?.total_unique_songs ?? 0;
  const totalLikes = summary.total_likes ?? stats?.total_likes ?? 0;
  const totalPlaylists = summary.total_playlists ?? stats?.total_playlists ?? 0;

  return (
    <div
      style={{ padding: 30, color: "white", maxWidth: 1200, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 42, margin: "0 0 8px 0", fontWeight: 900 }}>
          Thống kê cá nhân
        </h1>
        <p style={{ color: "#b3b3b3" }}>
          Nhìn lại hành trình âm nhạc của {user?.display_name || "bạn"}
        </p>
      </div>

      <div style={{ marginBottom: 30, display: "flex", gap: 12 }}>
        {["month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              background: period === p ? "#1db954" : "#282828",
              color: period === p ? "#000" : "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {p === "month" ? "Tháng này" : "Năm nay"}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <Clock size={28} color="#1db954" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Thời gian nghe</h3>
          <h2 style={{ fontSize: 36, margin: 0 }}>
            {Number(hours).toFixed(1)} <span style={{ fontSize: 18 }}>giờ</span>
          </h2>
        </div>

        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <Music size={28} color="#3b82f6" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Số bài đã nghe</h3>
          <h2 style={{ fontSize: 36, margin: 0 }}>{totalUnique}</h2>
        </div>

        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <Trophy size={28} color="#f59e0b" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Bài hát yêu thích</h3>
          <h2 style={{ fontSize: 36, margin: 0 }}>{totalLikes}</h2>
        </div>

        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <Users size={28} color="#8b5cf6" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Playlist của bạn</h3>
          <h2 style={{ fontSize: 36, margin: 0 }}>{totalPlaylists}</h2>
        </div>
      </div>

      <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 25 }}>
          Thể loại bạn nghe nhiều nhất
        </h3>
        <div style={{ height: 340 }}>
          {genreStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="play_count"
                  nameKey="genre_name"
                >
                  {genreStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#666", textAlign: "center", paddingTop: 80 }}>
              Chưa có dữ liệu thể loại
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
