import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminAPI } from "../../services/api";
import {
  Users,
  Music,
  Mic2,
  Disc3,
  Play,
  TrendingUp,
  UserPlus,
  DollarSign,
  RefreshCw,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n ?? 0);
};
const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

// ── Màu sắc ─────────────────────────────────────────────────────────────────
const GREEN = "#1db954";
const DIM = "#b3b3b3";
const CARD_BG = "#181818";
const PIE_COLORS = ["#1db954", "#1ed760", "#17a349", "#0f7a34", "#0a5226"];

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color = GREEN }) => (
  <div
    style={{
      background: CARD_BG,
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      border: "1px solid #282828",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          background: color + "22",
          borderRadius: 8,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <span style={{ color: DIM, fontSize: 13 }}>{label}</span>
    </div>
    <div
      style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}
    >
      {value}
    </div>
    {sub && <div style={{ color: DIM, fontSize: 12 }}>{sub}</div>}
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#282828",
        border: "1px solid #333",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      <p style={{ color: DIM, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("week");
  const [musicData, setMusicData] = useState(null);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getOverview();
      if (res.success) setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMusicAnalytics = async (p) => {
    try {
      const res = await adminAPI.getMusicAnalytics(p);
      if (res.success) setMusicData(res.data);
    } catch (e) {
      console.warn("Music analytics:", e.message);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);
  useEffect(() => {
    loadMusicAnalytics(period);
  }, [period]);

  if (loading)
    return (
      <div style={{ padding: 40, color: DIM, textAlign: "center" }}>
        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 12 }}>Đang tải dữ liệu...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, color: "#ef4444", textAlign: "center" }}>
        <p>⚠️ {error}</p>
        <button
          onClick={loadOverview}
          style={{
            marginTop: 12,
            padding: "8px 20px",
            background: GREEN,
            color: "#000",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Thử lại
        </button>
      </div>
    );

  const kpi = data?.kpi ?? {};

  return (
    <div
      style={{
        padding: "32px 36px",
        color: "#fff",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
            Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", color: DIM, fontSize: 14 }}>
            Tổng quan hệ thống Spotify Clone
          </p>
        </div>
        <button
          onClick={loadOverview}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "#282828",
            border: "none",
            borderRadius: 20,
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <KpiCard
          icon={Users}
          label="Tổng người dùng"
          value={fmt(kpi.total_users)}
          sub={`${fmt(kpi.free_users)} free · ${fmt(kpi.premium_users)} premium`}
        />
        <KpiCard icon={Music} label="Bài hát" value={fmt(kpi.total_songs)} />
        <KpiCard icon={Mic2} label="Nghệ sĩ" value={fmt(kpi.total_artists)} />
        <KpiCard icon={Disc3} label="Album" value={fmt(kpi.total_albums)} />
        <KpiCard
          icon={Play}
          label="Lượt nghe hôm nay"
          value={fmt(kpi.plays_today)}
          sub={`Tuần: ${fmt(kpi.plays_this_week)}`}
          color="#3b82f6"
        />
        <KpiCard
          icon={TrendingUp}
          label="Lượt nghe tháng"
          value={fmt(kpi.plays_this_month)}
          color="#8b5cf6"
        />
        <KpiCard
          icon={UserPlus}
          label="User mới hôm nay"
          value={fmt(kpi.new_users_today)}
          sub={`Tuần: ${fmt(kpi.new_users_this_week)}`}
          color="#f59e0b"
        />
        <KpiCard
          icon={DollarSign}
          label="Doanh thu tháng"
          value={fmtVND(kpi.revenue_this_month)}
          color="#10b981"
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* User mới theo tháng */}
        <div
          style={{
            background: CARD_BG,
            borderRadius: 12,
            padding: 24,
            border: "1px solid #282828",
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>
            📈 Người dùng mới theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data?.monthly_new_users ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis dataKey="month_label" tick={{ fill: DIM, fontSize: 11 }} />
              <YAxis tick={{ fill: DIM, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: DIM, fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="new_users"
                name="Mới"
                stroke={GREEN}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cumulative_users"
                name="Tổng cộng"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lượt nghe theo tháng */}
        <div
          style={{
            background: CARD_BG,
            borderRadius: 12,
            padding: 24,
            border: "1px solid #282828",
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>
            🎵 Lượt nghe theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.monthly_plays ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis dataKey="month_label" tick={{ fill: DIM, fontSize: 11 }} />
              <YAxis tick={{ fill: DIM, fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="play_count"
                name="Lượt nghe"
                fill={GREEN}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2: Music Analytics ── */}
      <div
        style={{
          background: CARD_BG,
          borderRadius: 12,
          padding: 24,
          border: "1px solid #282828",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
            🏆 Top bài hát
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            {["week", "month", "all_time"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "5px 14px",
                  border: "none",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: period === p ? GREEN : "#282828",
                  color: period === p ? "#000" : DIM,
                }}
              >
                {p === "week" ? "7 ngày" : p === "month" ? "30 ngày" : "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* Top songs list */}
          <div>
            {(musicData?.top_songs ?? []).slice(0, 5).map((song) => (
              <div
                key={song.song_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #282828",
                }}
              >
                <span
                  style={{
                    color: GREEN,
                    fontWeight: 800,
                    width: 20,
                    textAlign: "right",
                    fontSize: 14,
                  }}
                >
                  {song.rank}
                </span>
                <img
                  src={song.cover_url || "/default-cover.png"}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {song.title}
                  </div>
                  <div style={{ color: DIM, fontSize: 12 }}>
                    {song.artist?.name}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {fmt(song.play_count)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: song.growth_rate >= 0 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {song.growth_rate >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(song.growth_rate)}%
                  </div>
                </div>
              </div>
            ))}
            {!musicData?.top_songs?.length && (
              <p style={{ color: DIM, fontSize: 13 }}>Chưa có dữ liệu</p>
            )}
          </div>

          {/* Genre pie chart */}
          <div>
            <p style={{ color: DIM, fontSize: 13, marginBottom: 12 }}>
              Phân bổ thể loại
            </p>
            {musicData?.genre_distribution?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={musicData.genre_distribution}
                    dataKey="play_count"
                    nameKey="genre_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ genre_name, percentage }) =>
                      percentage > 5 ? `${genre_name} ${percentage}%` : ""
                    }
                    labelLine={false}
                  >
                    {musicData.genre_distribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [fmt(v), "Lượt nghe"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: DIM, fontSize: 13 }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Trending ── */}
      {musicData?.trending_songs?.length > 0 && (
        <div
          style={{
            background: CARD_BG,
            borderRadius: 12,
            padding: 24,
            border: "1px solid #282828",
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>
            🔥 Trending tuần này
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {musicData.trending_songs.slice(0, 6).map((s) => (
              <div
                key={s.song_id}
                style={{
                  background: "#282828",
                  borderRadius: 8,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.title}
                </div>
                <div style={{ color: DIM, fontSize: 12 }}>{s.artist?.name}</div>
                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: DIM, fontSize: 11 }}>
                    {fmt(s.this_week_plays)} plays
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: s.growth_rate >= 0 ? "#10b981" : "#ef4444",
                      background:
                        (s.growth_rate >= 0 ? "#10b981" : "#ef4444") + "22",
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    {s.growth_rate >= 0 ? "+" : ""}
                    {s.growth_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
