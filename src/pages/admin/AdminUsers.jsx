import React, { useState, useEffect, useRef } from "react";
import { adminAPI } from "../../services/api";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Ban,
  CreditCard,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";

const GREEN = "#1db954";
const DIM = "#b3b3b3";

const useToast = () => {
  const [toast, setToast] = useState(null);
  const t = useRef(null);
  const show = (msg, type = "success") => {
    clearTimeout(t.current);
    setToast({ msg, type });
    t.current = setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
};

const fmt = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n ?? 0);
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 9px",
      borderRadius: 20,
      color,
      background: color + "22",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

// ── User Detail Drawer ────────────────────────────────────────────────────────
const UserDrawer = ({ userId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getUserDetail(userId)
      .then((r) => {
        if (r.success) setDetail(r.data);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 380,
          background: "#181818",
          height: "100%",
          overflowY: "auto",
          padding: 28,
          borderLeft: "1px solid #282828",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            Chi tiết người dùng
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: DIM,
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p style={{ color: DIM }}>Đang tải...</p>
        ) : !detail ? (
          <p style={{ color: "#ef4444" }}>Không tìm thấy</p>
        ) : (
          <>
            {/* Avatar + name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#282828",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: GREEN,
                }}
              >
                {detail.avatar_url ? (
                  <img
                    src={detail.avatar_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  detail.display_name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {detail.display_name}
                </div>
                <div style={{ color: DIM, fontSize: 13 }}>{detail.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Badge
                    label={detail.role === "admin" ? "Admin" : "User"}
                    color={detail.role === "admin" ? "#f59e0b" : "#3b82f6"}
                  />
                  <Badge
                    label={detail.plan === "free" ? "Free" : "Premium"}
                    color={detail.plan === "free" ? DIM : GREEN}
                  />
                  <Badge
                    label={detail.is_active ? "Hoạt động" : "Bị khoá"}
                    color={detail.is_active ? GREEN : "#ef4444"}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                { label: "Lượt nghe", value: fmt(detail.stats?.total_plays) },
                {
                  label: "Giờ nghe",
                  value: (detail.stats?.total_hours ?? 0).toFixed(1) + "h",
                },
                { label: "Đã thích", value: fmt(detail.stats?.total_likes) },
                {
                  label: "Playlist",
                  value: fmt(detail.stats?.total_playlists),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "#282828",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ color: DIM, fontSize: 11, marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div style={{ borderTop: "1px solid #282828", paddingTop: 16 }}>
              {[
                { label: "Quốc gia", value: detail.country || "—" },
                { label: "Tham gia", value: fmtDate(detail.created_at) },
                {
                  label: "Đăng nhập gần nhất",
                  value: fmtDate(detail.last_login_at),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #1e1e1e",
                  }}
                >
                  <span style={{ color: DIM, fontSize: 13 }}>{label}</span>
                  <span style={{ fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Subscription history */}
            {detail.subscription_history?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p
                  style={{
                    color: DIM,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  Lịch sử đăng ký
                </p>
                {detail.subscription_history.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#282828",
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginBottom: 8,
                      fontSize: 13,
                    }}
                  >
                    <div
                      style={{ fontWeight: 600, textTransform: "capitalize" }}
                    >
                      {s.plan}
                    </div>
                    <div style={{ color: DIM, fontSize: 12 }}>
                      {fmtDate(s.start_date)} —{" "}
                      {s.end_date ? fmtDate(s.end_date) : "Hiện tại"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [detailId, setDetailId] = useState(null);
  const { toast, show: showToast } = useToast();
  const searchTimer = useRef(null);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        page: p,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
        plan: planFilter || undefined,
      });
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1);
    }, 400);
  }, [search, roleFilter, planFilter]);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleBlock = async (user) => {
    const newState = !user.is_active;
    try {
      const res = await adminAPI.blockUser(user.user_id, newState);
      if (res.success) {
        showToast(newState ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user.user_id ? { ...u, is_active: newState } : u,
          ),
        );
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (
      !window.confirm(`Đổi role của "${user.display_name}" thành "${newRole}"?`)
    )
      return;
    try {
      const res = await adminAPI.updateRole(user.user_id, newRole);
      if (res.success) {
        showToast(`Đã đổi role thành ${newRole}`);
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user.user_id ? { ...u, role: newRole } : u,
          ),
        );
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handlePlan = async (user, newPlan) => {
    try {
      const res = await adminAPI.updatePlan(user.user_id, newPlan);
      if (res.success) {
        showToast(`Đã đổi plan thành ${newPlan}`);
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user.user_id ? { ...u, plan: newPlan } : u,
          ),
        );
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const selectStyle = {
    background: "#181818",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "32px 36px", color: "#fff" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
            Quản lý người dùng
          </h1>
          <p style={{ margin: "4px 0 0", color: DIM, fontSize: 14 }}>
            {pagination.total} tài khoản
          </p>
        </div>
        <button
          onClick={() => fetchUsers(page)}
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

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: DIM,
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email..."
            style={{
              ...selectStyle,
              paddingLeft: 36,
              width: "100%",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="">Tất cả role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="">Tất cả plan</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: DIM, textAlign: "center", padding: 40 }}>
          Đang tải...
        </p>
      ) : (
        <div
          style={{
            background: "#181818",
            borderRadius: 12,
            border: "1px solid #282828",
            overflow: "hidden",
          }}
        >
          {/* Head */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 80px 90px 90px 80px 100px",
              padding: "12px 16px",
              background: "#282828",
              color: DIM,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            <span>#</span>
            <span>Người dùng</span>
            <span>Role</span>
            <span>Plan</span>
            <span>Plays</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {users.map((user, idx) => (
            <div
              key={user.user_id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 80px 90px 90px 80px 100px",
                padding: "10px 16px",
                borderBottom: "1px solid #282828",
                alignItems: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#282828")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span style={{ color: DIM, fontSize: 13 }}>
                {(pagination.page - 1) * 20 + idx + 1}
              </span>

              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {user.display_name}
                </div>
                <div style={{ color: DIM, fontSize: 12 }}>{user.email}</div>
                <div style={{ color: "#555", fontSize: 11 }}>
                  Tham gia: {fmtDate(user.created_at)}
                </div>
              </div>

              <div>
                <Badge
                  label={user.role === "admin" ? "Admin" : "User"}
                  color={user.role === "admin" ? "#f59e0b" : "#3b82f6"}
                />
              </div>

              {/* Plan dropdown */}
              <select
                value={user.plan}
                onChange={(e) => handlePlan(user, e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: user.plan === "free" ? DIM : GREEN,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>

              <span style={{ fontSize: 13 }}>{fmt(user.total_plays)}</span>

              <Badge
                label={user.is_active ? "Hoạt động" : "Bị khoá"}
                color={user.is_active ? GREEN : "#ef4444"}
              />

              <div style={{ display: "flex", gap: 6 }}>
                {/* Xem chi tiết */}
                <button
                  onClick={() => setDetailId(user.user_id)}
                  title="Chi tiết"
                  style={{
                    background: "#282828",
                    border: "none",
                    borderRadius: 6,
                    padding: 6,
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <Eye size={13} />
                </button>
                {/* Đổi role */}
                <button
                  onClick={() => handleRole(user)}
                  title={
                    user.role === "admin" ? "Hạ xuống User" : "Nâng lên Admin"
                  }
                  style={{
                    background: "#f59e0b22",
                    border: "none",
                    borderRadius: 6,
                    padding: 6,
                    cursor: "pointer",
                    color: "#f59e0b",
                  }}
                >
                  <ShieldCheck size={13} />
                </button>
                {/* Block / Unblock */}
                <button
                  onClick={() => handleBlock(user)}
                  title={user.is_active ? "Khoá tài khoản" : "Mở khoá"}
                  style={{
                    background: user.is_active ? "#ef444422" : "#10b98122",
                    border: "none",
                    borderRadius: 6,
                    padding: 6,
                    cursor: "pointer",
                    color: user.is_active ? "#ef4444" : "#10b981",
                  }}
                >
                  <Ban size={13} />
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <p style={{ color: DIM, textAlign: "center", padding: 40 }}>
              Không có user nào
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: "8px 16px",
              background: page <= 1 ? "#282828" : "#333",
              border: "none",
              borderRadius: 8,
              color: page <= 1 ? DIM : "#fff",
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: DIM, fontSize: 13 }}>
            Trang <strong style={{ color: "#fff" }}>{page}</strong> /{" "}
            {pagination.total_pages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.total_pages, p + 1))
            }
            disabled={page >= pagination.total_pages}
            style={{
              padding: "8px 16px",
              background: page >= pagination.total_pages ? "#282828" : "#333",
              border: "none",
              borderRadius: 8,
              color: page >= pagination.total_pages ? DIM : "#fff",
              cursor:
                page >= pagination.total_pages ? "not-allowed" : "pointer",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      {detailId && (
        <UserDrawer userId={detailId} onClose={() => setDetailId(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "error" ? "#ef4444" : GREEN,
            color: "#000",
            padding: "12px 24px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            animation: "fadeUp 0.2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translate(-50%,16px); } to { opacity:1; transform:translate(-50%,0); } }`}</style>
    </div>
  );
};

export default AdminUsers;
