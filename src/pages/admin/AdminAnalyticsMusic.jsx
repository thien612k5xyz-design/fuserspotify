import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
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

const GREEN = "#1db954";
const DIM = "#b3b3b3";
const CARD_BG = "#181818";
const PIE_COLORS = ["#1db954", "#1ed760", "#17a349", "#0f7a34", "#0a5226"];

const monthMap = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

const renderCustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  const parts = payload.value.split("-");
  if (parts.length !== 2) {
    return (
      <text x={x} y={y} dy={16} textAnchor="middle" fill={DIM} fontSize={11}>
        {payload.value}
      </text>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} textAnchor="middle" fill={DIM} fontSize={11}>
        <tspan x={0} dy="14">
          Tháng {parseInt(parts[1], 10)}
        </tspan>
        <tspan x={0} dy="16" fontSize={10} fill="#888">
          {parts[0]}
        </tspan>
      </text>
    </g>
  );
};

const formatTooltipLabel = (label) => {
  if (!label) return "";
  const parts = label.split("-");
  if (parts.length === 2) return `Tháng ${parseInt(parts[1], 10)}, ${parts[0]}`;
  return label;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  let displayLabel = label;
  if (label?.includes("-")) {
    const parts = label.split("-");
    displayLabel = `Tháng ${parseInt(parts[1], 10)}, ${parts[0]}`;
  }
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
      <p style={{ color: DIM, marginBottom: 6 }}>{displayLabel}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const renderCustomPieLabel = ({ x, y, name, percent, textAnchor }) => {
  if (percent * 100 <= 5) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={GREEN}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      <tspan x={x} dy="-0.4em">
        {name}
      </tspan>
      <tspan x={x} dy="1.4em" fill={DIM} fontWeight={400}>
        {(percent * 100).toFixed(0)}%
      </tspan>
    </text>
  );
};

const AdminAnalyticsMusic = () => {
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    top_songs: [],
    monthly_plays: [],
    genre_distribution: [],
    trending_songs: [],
  });

  const load = async (p = "week") => {
    setLoading(true);
    try {
      const res = await adminAPI.getMusicAnalytics(p);
      if (res.success) {
        const rawMonthly = res.data.yoy_comparison || [];
        const currentYear = new Date().getFullYear();

        const mappedMonthlyPlays = rawMonthly.map((item) => {
          const rawMonthStr = (item.month_label || "").trim().toLowerCase();
          const m = monthMap[rawMonthStr] || "01";
          return {
            month: `${currentYear}-${m}`,
            play_count: item.this_year_plays,
          };
        });

        setData({
          top_songs: res.data.top_songs || [],
          monthly_plays: mappedMonthlyPlays,
          genre_distribution: res.data.genre_distribution || [],
          trending_songs: res.data.trending_songs || [],
        });
      }
    } catch (e) {
      console.warn("Music analytics error:", e.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
  }, [period]);

  return (
    <div style={{ padding: 32, color: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Phân tích Âm nhạc</h1>
          <p style={{ margin: "6px 0 0", color: DIM }}>
            Lượt nghe, top bài hát và phân bổ thể loại
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["week", "month", "all_time"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background: period === p ? GREEN : "#282828",
                color: period === p ? "#000" : DIM,
                fontWeight: 700,
              }}
            >
              {p === "week" ? "7 ngày" : p === "month" ? "30 ngày" : "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: DIM }}>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 420px",
              gap: 20,
              marginBottom: 20,
            }}
          >
            {/* BIỂU ĐỒ LINE CHART */}
            <div
              style={{
                background: CARD_BG,
                borderRadius: 12,
                padding: 18,
                border: "1px solid #282828",
              }}
            >
              <h3 style={{ margin: "0 0 12px" }}>Lượt nghe theo thời gian</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={data.monthly_plays}
                  margin={{ left: 0, right: 15, top: 10, bottom: 35 }}
                >
                  <CartesianGrid stroke="#282828" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={renderCustomXAxisTick}
                    height={50}
                  />
                  <YAxis tick={{ fill: DIM, fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ color: DIM, paddingTop: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="play_count"
                    name="Lượt nghe"
                    stroke={GREEN}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* BIỂU ĐỒ PIE CHART */}
            <div
              style={{
                background: CARD_BG,
                borderRadius: 12,
                padding: 18,
                border: "1px solid #282828",
              }}
            >
              <h3 style={{ margin: "0 0 12px" }}>Phân bổ thể loại</h3>
              {data.genre_distribution.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <Pie
                      data={data.genre_distribution}
                      dataKey="play_count"
                      nameKey="genre_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={{ stroke: "#444", strokeWidth: 1 }}
                      label={renderCustomPieLabel}
                    >
                      {data.genre_distribution.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [v, "Lượt nghe"]}
                      contentStyle={{
                        background: "#282828",
                        border: "1px solid #333",
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: DIM }}>Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div
              style={{
                background: CARD_BG,
                borderRadius: 12,
                padding: 18,
                border: "1px solid #282828",
              }}
            >
              <h3 style={{ margin: "0 0 12px" }}>Top bài hát</h3>
              {(data.top_songs || []).slice(0, 10).map((s, i) => (
                <div
                  key={s.song_id || i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #282828",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      textAlign: "right",
                      color: GREEN,
                      fontWeight: 800,
                    }}
                  >
                    {i + 1}
                  </div>
                  <img
                    src={
                      s.cover_url
                        ? s.cover_url.startsWith("http")
                          ? s.cover_url
                          : `${s.cover_url}`
                        : "/default-cover.png"
                    }
                    alt=""
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.title}
                    </div>
                    <div style={{ color: DIM, fontSize: 12 }}>
                      {s.artist?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>{s.play_count}</div>
                    <div
                      style={{
                        color: s.growth_rate >= 0 ? "#10b981" : "#ef4444",
                        fontSize: 12,
                      }}
                    >
                      {s.growth_rate >= 0 ? "↑" : "↓"} {Math.abs(s.growth_rate)}
                      %
                    </div>
                  </div>
                </div>
              ))}
              {!data.top_songs.length && (
                <p style={{ color: DIM }}>Chưa có dữ liệu</p>
              )}
            </div>

            <div
              style={{
                background: CARD_BG,
                borderRadius: 12,
                padding: 18,
                border: "1px solid #282828",
              }}
            >
              <h3 style={{ margin: "0 0 12px" }}>Trending tuần này</h3>
              {(data.trending_songs || []).slice(0, 6).map((t) => (
                <div
                  key={t.song_id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #282828",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    <div style={{ color: DIM, fontSize: 12 }}>
                      {t.artist?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>
                      {t.this_week_plays} plays
                    </div>
                    <div
                      style={{
                        color: t.growth_rate >= 0 ? "#10b981" : "#ef4444",
                        fontSize: 12,
                      }}
                    >
                      {t.growth_rate >= 0 ? "+" : ""}
                      {t.growth_rate}%
                    </div>
                  </div>
                </div>
              ))}
              {!data.trending_songs.length && (
                <p style={{ color: DIM }}>Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsMusic;
