import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CARD_BG = "#181818";
const DIM = "#b3b3b3";
const GREEN = "#1db954";

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

const AdminAnalyticsUsers = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    monthly_new_users: [],
    user_distribution: { free: 0, premium: 0 },
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserAnalytics();
      if (res.success) {
        const rawTrend = res.data.plan_trend || [];
        const mappedTrend = rawTrend.map((item) => ({
          month: item.month,
          // Tổng user mới = user free mới + user premium mới
          new_users: item.free + item.premium,
        }));

        setData({
          monthly_new_users: mappedTrend,
          user_distribution: {
            free: res.data.plan_distribution?.free || 0,
            premium: res.data.plan_distribution?.premium || 0,
          },
        });
      }
    } catch (e) {
      console.warn("User analytics error:", e.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalUsers =
    data.user_distribution.free + data.user_distribution.premium;

  return (
    <div style={{ padding: 32, color: "#fff" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Phân tích người dùng</h1>
      <p style={{ margin: "6px 0 18px", color: DIM }}>
        Số user mới theo tháng và phân bố Free / Premium
      </p>

      {loading ? (
        <p style={{ color: DIM }}>Đang tải dữ liệu...</p>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}
        >
          {/* Biểu đồ */}
          <div
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: 18,
              border: "1px solid #282828",
            }}
          >
            <h3 style={{ margin: "0 0 12px" }}>Người dùng mới theo tháng</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={data.monthly_new_users}
                margin={{ left: 0, right: 15, bottom: 25 }}
              >
                <CartesianGrid stroke="#282828" />
                <XAxis dataKey="month" tick={renderCustomXAxisTick} />
                <YAxis tick={{ fill: DIM }} />
                <Tooltip
                  labelFormatter={formatTooltipLabel}
                  contentStyle={{
                    background: "#282828",
                    border: "1px solid #333",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="new_users" name="Tài khoản mới" fill={GREEN} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Phân bố */}
          <div
            style={{
              background: CARD_BG,
              borderRadius: 12,
              padding: 18,
              border: "1px solid #282828",
            }}
          >
            <h3 style={{ margin: "0 0 12px" }}>Phân bố người dùng</h3>
            <div style={{ fontSize: 14, marginBottom: 12, color: DIM }}>
              <div>
                <strong style={{ color: "#fff" }}>{totalUsers}</strong> tổng
                người dùng
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ color: DIM }}>Free</div>
                  <div style={{ color: "#fff" }}>
                    {data.user_distribution.free}
                  </div>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "#282828",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${totalUsers > 0 ? (data.user_distribution.free / totalUsers) * 100 : 0}%`,
                      height: "100%",
                      background: "#6b7280",
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ color: DIM }}>Premium</div>
                  <div style={{ color: "#fff" }}>
                    {data.user_distribution.premium}
                  </div>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "#282828",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${totalUsers > 0 ? (data.user_distribution.premium / totalUsers) * 100 : 0}%`,
                      height: "100%",
                      background: GREEN,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsUsers;
