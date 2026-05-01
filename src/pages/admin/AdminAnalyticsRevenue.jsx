import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CARD_BG = "#181818";
const DIM = "#b3b3b3";
const GREEN = "#10b981";

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

// HÀM RENDER TRỤC X:
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
        {/* Dòng trên hiển thị Tháng */}
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

const AdminAnalyticsRevenue = () => {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getRevenueAnalytics();
      if (res.success) setMonthly(res.data.monthly_revenue || []);
    } catch (e) {
      console.warn("Revenue analytics error:", e.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 32, color: "#fff" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Phân tích doanh thu</h1>
      <p style={{ margin: "6px 0 18px", color: DIM }}>Doanh thu theo tháng</p>
      {loading ? (
        <p style={{ color: DIM }}>Đang tải...</p>
      ) : (
        <div
          style={{
            background: CARD_BG,
            borderRadius: 12,
            padding: 18,
            border: "1px solid #282828",
          }}
        >
          <ResponsiveContainer width="100%" height={320}>
            {/* Thêm bottom: 25 để biểu đồ dài xuống dưới, không cắt chữ */}
            <LineChart
              data={monthly}
              margin={{ left: 10, right: 30, bottom: 25 }}
            >
              <CartesianGrid stroke="#282828" />
              <XAxis dataKey="month" tick={renderCustomXAxisTick} />
              <YAxis
                tick={{ fill: DIM }}
                width={100}
                tickFormatter={(v) => fmtVND(v)}
              />
              <Tooltip
                formatter={(v) => fmtVND(v)}
                labelFormatter={formatTooltipLabel}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={GREEN}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsRevenue;
