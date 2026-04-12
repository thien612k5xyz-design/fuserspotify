import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { userAPI } from "../services/api";
import {
  Clock,
  Music,
  Trophy,
  Disc3,
  Play,
  User as UserIcon,
  Calendar,
} from "lucide-react";
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
import { usePlayerStore } from "../store/usePlayerStore";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const playSong = usePlayerStore((state) => state.playSong);

  // States
  const [stats, setStats] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [genreStats, setGenreStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [period, setPeriod] = useState("all");

  const COLORS = ["#1db954", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, genresRes, topRes] = await Promise.all([
          userAPI.getStats(period, "", ""),
          userAPI.getGenreDistribution(period, "", ""),
          userAPI.getTopTracks(5),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (genresRes.success) {
          setGenreStats(genresRes.data.genre_distribution || genresRes.data);
        }
        if (topRes.success) setTopSongs(topRes.data);
      } catch (error) {
        console.error("Lỗi Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [period]);

  if (isLoading)
    return (
      <div style={{ padding: "50px", color: "white" }}>
        Phân tích gu âm nhạc của bạn...
      </div>
    );

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* HEADER & FILTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "40px",
              margin: "0 0 10px 0",
              fontWeight: "900",
            }}
          >
            Thống kê cá nhân
          </h1>
          <p style={{ color: "#b3b3b3", margin: 0 }}>
            Nhìn lại hành trình âm nhạc của {user?.display_name}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            background: "#181818",
            padding: "5px",
            borderRadius: "8px",
          }}
        >
          {["all", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                background: period === p ? "#333" : "transparent",
                color: period === p ? "white" : "#b3b3b3",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {p === "all" ? "Tất cả" : p === "month" ? "Tháng này" : "Năm nay"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
            borderLeft: "4px solid #1db954",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#b3b3b3",
              marginBottom: "15px",
            }}
          >
            <span>Thời gian nghe</span>
            <Clock size={20} color="#1db954" />
          </div>
          <h2 style={{ margin: 0, fontSize: "32px" }}>
            {stats?.total_hours || 0}{" "}
            <span style={{ fontSize: "16px" }}>giờ</span>
          </h2>
        </div>
        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#b3b3b3",
              marginBottom: "15px",
            }}
          >
            <span>Số bài hát</span>
            <Music size={20} color="#3b82f6" />
          </div>
          <h2 style={{ margin: 0, fontSize: "32px" }}>
            {stats?.total_songs_played || 0}
          </h2>
        </div>
        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#b3b3b3",
              marginBottom: "15px",
            }}
          >
            <span>Top Nghệ sĩ</span>
            <Trophy size={20} color="#f59e0b" />
          </div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            {stats?.top_artist || "Đang cập nhật"}
          </h2>
        </div>
      </div>

      {/* CHARTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px",
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
          <h3 style={{ marginTop: 0, marginBottom: "30px" }}>
            Lịch sử nghe nhạc
          </h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.listening_history || []}>
                <XAxis dataKey="day" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#282828",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#1db954"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#1db954" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          style={{
            background: "#181818",
            padding: "24px",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Thể loại gu</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="genre_name"
                >
                  {genreStats.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP TRACKS */}
      <div
        style={{ background: "#181818", padding: "24px", borderRadius: "12px" }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
          Bài hát bạn nghe nhiều nhất
        </h3>
        {topSongs.length > 0 ? (
          topSongs.map((song, i) => (
            <div
              key={song.song_id}
              className="song-item"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <span
                style={{ width: "30px", color: "#1db954", fontWeight: "bold" }}
              >
                {i + 1}
              </span>
              <img
                src={song.cover_url}
                alt=""
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "4px",
                  marginRight: "15px",
                }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{song.title}</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#b3b3b3" }}>
                  {song.artist_name}
                </p>
              </div>
              <button
                onClick={() => playSong(song)}
                style={{
                  background: "transparent",
                  border: "1px solid #333",
                  color: "white",
                  padding: "8px",
                  borderRadius: "50%",
                }}
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          ))
        ) : (
          <p style={{ color: "#b3b3b3", textAlign: "center" }}>
            Chưa có dữ liệu bài hát.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
