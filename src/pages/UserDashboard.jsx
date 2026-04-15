import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { Clock, Music, Trophy, Users, Activity, Play } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
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
        const statsData = statsRes?.success ? statsRes.data : statsRes;
        const genresData = genresRes?.success ? genresRes.data : genresRes;
        setStats(statsData || null);
        setGenreStats(Array.isArray(genresData) ? genresData : []);
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

  const computeDerivedStats = (statsObj) => {
    if (!statsObj)
      return {
        hours: 0,
        totalUnique: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalPlaylists: 0,
        topGenre: null,
        topSongs: [],
        topArtists: [],
        dailyChart: [],
      };

    const summary = statsObj.summary || {};
    const backendHours =
      parseFloat(summary.total_hours ?? statsObj.total_hours ?? 0) || 0;
    const daily = Array.isArray(statsObj.daily_chart)
      ? statsObj.daily_chart
      : [];

    const hoursFromDaily = daily.reduce(
      (acc, d) => acc + (parseFloat(d.hours) || 0),
      0,
    );
    const hours =
      backendHours > 0.01
        ? Number(backendHours)
        : Number(Number(hoursFromDaily).toFixed(2));

    const backendUnique =
      parseInt(
        summary.total_unique_songs ?? statsObj.total_unique_songs ?? 0,
        10,
      ) || 0;
    const topSongs = Array.isArray(statsObj.top_songs)
      ? statsObj.top_songs
      : [];

    const uniqueIds = new Set();
    topSongs.forEach((s) => {
      if (s?.song_id) uniqueIds.add(String(s.song_id));
    });

    const totalUnique = backendUnique > 0 ? backendUnique : uniqueIds.size;
    const totalPlays =
      parseInt(summary.total_plays ?? statsObj.total_plays ?? 0, 10) || 0;
    const totalLikes =
      parseInt(summary.total_likes ?? statsObj.total_likes ?? 0, 10) || 0;
    const totalPlaylists =
      parseInt(summary.total_playlists ?? statsObj.total_playlists ?? 0, 10) ||
      0;

    const topGenre = statsObj.top_genre
      ? {
          ...statsObj.top_genre,
          percentage:
            typeof statsObj.top_genre.percentage === "number"
              ? statsObj.top_genre.percentage
              : totalPlays > 0
                ? Number(
                    (
                      (statsObj.top_genre.play_count / totalPlays) *
                      100
                    ).toFixed(1),
                  )
                : 0,
        }
      : null;

    const topArtists = Array.isArray(statsObj.top_artists)
      ? statsObj.top_artists
      : [];

    // Format lại ngày tháng cho biểu đồ
    const dailyChart = daily.map((d) => ({
      date: new Date(d.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      hours: Number(parseFloat(d.hours || 0).toFixed(2)),
      play_count: parseInt(d.play_count || 0, 10) || 0,
    }));

    return {
      hours,
      totalUnique,
      totalPlays,
      totalLikes,
      totalPlaylists,
      topGenre,
      topSongs,
      topArtists,
      dailyChart,
    };
  };

  const derived = computeDerivedStats(stats);

  return (
    <div
      style={{
        padding: 30,
        color: "white",
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 42, margin: "0 0 8px 0", fontWeight: 900 }}>
          Thống kê cá nhân
        </h1>
        <p style={{ color: "#b3b3b3" }}>
          Nhìn lại hành trình âm nhạc của {user?.display_name || "bạn"} trong{" "}
          {stats?.period?.label || "thời gian qua"}
        </p>
      </div>

      {/* Period Selector */}
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

      {/* Main Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        <StatCard
          icon={<Clock size={28} color="#1db954" />}
          title="Thời gian nghe"
          value={`${derived.hours.toFixed(1)} giờ`}
        />
        <StatCard
          icon={<Play size={28} color="#1db954" />}
          title="Tổng lượt phát"
          value={derived.totalPlays}
        />
        <StatCard
          icon={<Music size={28} color="#3b82f6" />}
          title="Số bài đã nghe"
          value={derived.totalUnique}
        />
        <StatCard
          icon={<Trophy size={28} color="#f59e0b" />}
          title="Bài hát yêu thích"
          value={derived.totalLikes}
        />
        <StatCard
          icon={<Users size={28} color="#8b5cf6" />}
          title="Playlist"
          value={derived.totalPlaylists}
        />
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {/* Daily Activity Chart */}
        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0, marginBottom: 25 }}>
            Hoạt động nghe nhạc (Giờ)
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={derived.dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#b3b3b3" fontSize={12} />
                <YAxis stroke="#b3b3b3" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#282828",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#1db954"
                  strokeWidth={3}
                  dot={{ fill: "#1db954" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Pie Chart */}
        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0, marginBottom: 25 }}>
            Thể loại nghe nhiều nhất
          </h3>
          <div style={{ height: 300 }}>
            {genreStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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

      {/* Top Lists Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 20,
        }}
      >
        {/* Top Songs */}
        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Top Bài Hát</h3>
          {derived.topSongs.map((song, idx) => (
            <div
              key={song.song_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginBottom: 15,
              }}
            >
              <span style={{ color: "#b3b3b3", width: 20, fontWeight: "bold" }}>
                {idx + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{song.title}</div>
                <div style={{ fontSize: 13, color: "#b3b3b3" }}>
                  {song.artist.name}
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#1db954" }}>
                {song.play_count} lượt
              </div>
            </div>
          ))}
        </div>

        {/* Top Artists */}
        <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Top Nghệ Sĩ</h3>
          {derived.topArtists.map((artist, idx) => (
            <div
              key={artist.artist_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginBottom: 15,
              }}
            >
              <span style={{ color: "#b3b3b3", width: 20, fontWeight: "bold" }}>
                {idx + 1}
              </span>
              <div style={{ flex: 1, fontWeight: 600 }}>{artist.name}</div>
              <div style={{ fontSize: 14, color: "#3b82f6" }}>
                {artist.play_count} lượt
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Comparison */}
      {stats?.community_comparison && (
        <div
          style={{
            marginTop: 20,
            background: "#1db954",
            padding: 20,
            borderRadius: 12,
            color: "#000",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={24} />
            <h4 style={{ margin: 0 }}>So sánh cộng đồng</h4>
          </div>
          <p style={{ margin: "8px 0 0 0", fontWeight: 600 }}>
            {stats.community_comparison.label}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper component cho các thẻ thống kê
const StatCard = ({ icon, title, value }) => (
  <div style={{ background: "#181818", padding: 24, borderRadius: 12 }}>
    {icon}
    <h3 style={{ margin: "15px 0 8px 0", fontSize: 16, color: "#b3b3b3" }}>
      {title}
    </h3>
    <h2 style={{ fontSize: 28, margin: 0 }}>{value}</h2>
  </div>
);

export default UserDashboard;
