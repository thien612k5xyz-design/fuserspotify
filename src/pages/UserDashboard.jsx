import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { Play, Clock, Music, Trophy, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const COLORS = ["#1db954", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const [statsRes, genresRes] = await Promise.all([
          userAPI.getStats(period),
          userAPI.getGenreDistribution(period),
        ]);

        if (statsRes?.success) {
          setStats(statsRes.data || statsRes);
        }

        if (genresRes?.success) {
          setGenreStats(genresRes.data || []);
        }
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
      <div style={{ padding: "60px", color: "white", textAlign: "center" }}>
        Đang tải thống kê cá nhân...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{ fontSize: "42px", margin: "0 0 8px 0", fontWeight: "900" }}
        >
          Thống kê cá nhân
        </h1>
        <p style={{ color: "#b3b3b3" }}>
          Nhìn lại hành trình âm nhạc của {user?.display_name || "bạn"}
        </p>
      </div>

      {/* Period Filter */}
      <div style={{ marginBottom: "30px", display: "flex", gap: "12px" }}>
        {["all", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: period === p ? "#1db954" : "#282828",
              color: period === p ? "#000" : "#fff",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {p === "all" ? "Tất cả" : p === "month" ? "Tháng này" : "Năm nay"}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
          }}
        >
          <Clock size={28} color="#1db954" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Thời gian nghe</h3>
          <h2 style={{ fontSize: "36px", margin: 0 }}>
            {stats?.total_hours?.toFixed(1) || 0}{" "}
            <span style={{ fontSize: "18px" }}>giờ</span>
          </h2>
        </div>

        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
          }}
        >
          <Music size={28} color="#3b82f6" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Số bài đã nghe</h3>
          <h2 style={{ fontSize: "36px", margin: 0 }}>
            {stats?.total_unique_songs || 0}
          </h2>
        </div>

        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
          }}
        >
          <Trophy size={28} color="#f59e0b" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Bài hát yêu thích</h3>
          <h2 style={{ fontSize: "36px", margin: 0 }}>
            {stats?.total_likes || 0}
          </h2>
        </div>

        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
          }}
        >
          <Users size={28} color="#8b5cf6" />
          <h3 style={{ margin: "15px 0 8px 0" }}>Playlist của bạn</h3>
          <h2 style={{ fontSize: "36px", margin: 0 }}>
            {stats?.total_playlists || 0}
          </h2>
        </div>
      </div>

      <div
        style={{ background: "#181818", padding: "24px", borderRadius: "12px" }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "25px" }}>
          Thể loại bạn nghe nhiều nhất
        </h3>
        <div style={{ height: "340px" }}>
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
            <p
              style={{ color: "#666", textAlign: "center", paddingTop: "80px" }}
            >
              Chưa có dữ liệu thể loại
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
