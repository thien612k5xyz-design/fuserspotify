import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  Database,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const fmt = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
};
const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );
const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

const GREEN = "#1db954";
const DIM = "#b3b3b3";
const CARD_BG = "#181818";

const renderCustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  const parts = payload.value.split("-");
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
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

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

const StatusBadge = ({ status }) => {
  const map = {
    running: { color: "#3b82f6", bg: "#3b82f622", label: "Đang chạy" },
    success: { color: "#10b981", bg: "#10b98122", label: "Thành công" },
    failed: { color: "#ef4444", bg: "#ef444422", label: "Thất bại" },
    pending: { color: "#f59e0b", bg: "#f59e0b22", label: "Chờ" },
  };
  const s = map[status] || {
    color: DIM,
    bg: "#ffffff11",
    label: status || "—",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}44`,
      }}
    >
      {status === "running" && (
        <RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} />
      )}
      {status === "success" && <CheckCircle size={11} />}
      {status === "failed" && <XCircle size={11} />}
      {status === "pending" && <Clock size={11} />}
      {s.label}
    </span>
  );
};

const StageRow = ({ stage }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 0",
      borderBottom: "1px solid #282828",
    }}
  >
    <div style={{ width: 130, color: "#fff", fontWeight: 600, fontSize: 13 }}>
      {stage.stage}
    </div>
    <StatusBadge status={stage.status} />
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        gap: 16,
        fontSize: 12,
        color: DIM,
      }}
    >
      {stage.rows_in != null && (
        <span>
          Nhận: <strong style={{ color: "#fff" }}>{stage.rows_in}</strong>
        </span>
      )}
      {stage.rows_out != null && (
        <span>
          Xử lý: <strong style={{ color: GREEN }}>{stage.rows_out}</strong>
        </span>
      )}
      {stage.rows_error != null && Number(stage.rows_error) > 0 && (
        <span>
          Lỗi: <strong style={{ color: "#ef4444" }}>{stage.rows_error}</strong>
        </span>
      )}
    </div>
  </div>
);

const ETLPanel = () => {
  const [etlStatus, setEtlStatus] = useState(null);
  const [etlStarting, setEtlStarting] = useState(false);
  const [etlError, setEtlError] = useState(null);
  const [showStages, setShowStages] = useState(false);
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  // ── SỬA: dùng useCallback để tránh stale closure ──────────────────────────
  const fetchETLStatus = useCallback(async (run_id) => {
    try {
      const res = await adminAPI.getETLStatus(run_id);
      if (res.success) {
        setEtlStatus(res.data);
        if (res.data?.status === "running") {
          pollRef.current = setTimeout(
            () => fetchETLStatus(res.data.run_id),
            3000,
          );
        } else {
          stopPolling();
        }
      }
    } catch (e) {
      setEtlError(e.message);
      stopPolling();
    }
  }, []); // [] vì chỉ dùng setState và ref

  const handleRunETL = async () => {
    setEtlStarting(true);
    setEtlError(null);
    try {
      const res = await adminAPI.runETL();
      if (res.success) {
        fetchETLStatus(res.data.run_id);
      } else {
        setEtlError(res.message || "Không thể khởi động đồng bộ");
      }
    } catch (e) {
      setEtlError(e.message);
    } finally {
      setEtlStarting(false);
    }
  };

  // ── SỬA: thêm fetchETLStatus vào dependency array ────────────────────────
  useEffect(() => {
    fetchETLStatus();
    return () => stopPolling();
  }, [fetchETLStatus]);

  const isRunning = etlStatus?.status === "running";

  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 12,
        padding: 24,
        border: "1px solid #282828",
        marginTop: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: etlStatus ? 20 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "#3b82f622",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Database size={18} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Đồng bộ dữ liệu</div>
            {etlStatus && (
              <div style={{ color: DIM, fontSize: 12, marginTop: 2 }}>
                Lần chạy gần nhất: {fmtDate(etlStatus.started_at)}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {etlStatus && <StatusBadge status={etlStatus.status} />}
          <button
            onClick={handleRunETL}
            disabled={isRunning || etlStarting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: isRunning || etlStarting ? "#282828" : GREEN,
              border: "none",
              borderRadius: 20,
              color: isRunning || etlStarting ? DIM : "#000",
              cursor: isRunning || etlStarting ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {etlStarting || isRunning ? (
              <RefreshCw
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Play size={13} />
            )}
            {isRunning
              ? "Đang đồng bộ..."
              : etlStarting
                ? "Đang khởi động..."
                : "Bắt đầu đồng bộ"}
          </button>
        </div>
      </div>

      {etlError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#ef444422",
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#ef4444",
            fontSize: 13,
          }}
        >
          <AlertCircle size={14} /> {etlError}
        </div>
      )}

      {etlStatus && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Mã lần chạy", value: `#${etlStatus.run_id}` },
              {
                label: "Thời gian",
                value:
                  etlStatus.duration_seconds != null
                    ? `${etlStatus.duration_seconds}s`
                    : "—",
              },
              {
                label: "Dữ liệu lấy về",
                value: etlStatus.rows_extracted ?? "—",
              },
              { label: "Dữ liệu đã lưu", value: etlStatus.rows_loaded ?? "—" },
              { label: "Nguồn chạy", value: etlStatus.triggered_by || "—" },
              { label: "Kết thúc", value: fmtDate(etlStatus.finished_at) },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: DIM, marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>
                  {String(item.value)}
                </div>
              </div>
            ))}
          </div>
          {isRunning && etlStatus.current_stage && (
            <div
              style={{
                padding: "8px 14px",
                background: "#3b82f611",
                border: "1px solid #3b82f644",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#93c5fd",
                marginBottom: 12,
              }}
            >
              <RefreshCw
                size={12}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Đang thực hiện: <strong>{etlStatus.current_stage}</strong>
            </div>
          )}
          {etlStatus.stages?.length > 0 && (
            <>
              <button
                onClick={() => setShowStages(!showStages)}
                style={{
                  background: "none",
                  border: "none",
                  color: DIM,
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                {showStages ? "▲ Ẩn chi tiết" : "▼ Xem chi tiết các bước xử lý"}
              </button>
              {showStages && (
                <div style={{ marginTop: 12 }}>
                  {etlStatus.stages.map((s, i) => (
                    <StageRow key={i} stage={s} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOverview();
      if (res.success) setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div style={{ padding: 40, color: DIM, textAlign: "center" }}>
        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
            Tổng quan hệ thống
          </h1>
        </div>
        <button
          onClick={load}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div
          style={{
            background: CARD_BG,
            borderRadius: 12,
            padding: 24,
            border: "1px solid #282828",
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>
            Người dùng mới theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={data?.monthly_new_users ?? []}
              margin={{ left: 0, right: 15, top: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis dataKey="month" tick={renderCustomXAxisTick} height={50} />
              <YAxis tick={{ fill: DIM, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ color: DIM, fontSize: 12, paddingTop: 10 }}
              />
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
        <div
          style={{
            background: CARD_BG,
            borderRadius: 12,
            padding: 24,
            border: "1px solid #282828",
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600 }}>
            Lượt nghe theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data?.monthly_plays ?? []}
              margin={{ left: 0, right: 15, top: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis dataKey="month" tick={renderCustomXAxisTick} height={50} />
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

      <ETLPanel />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default AdminDashboard;
