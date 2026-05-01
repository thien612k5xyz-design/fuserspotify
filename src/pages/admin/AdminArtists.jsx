import React, { useState, useEffect, useRef, useCallback } from "react";
import { adminAPI } from "../../services/api";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";
const GREEN = "#1db954";
const DIM = "#b3b3b3";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};
const fmt = (n) => {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const t = useRef(null);
  const show = useCallback((msg, type = "success") => {
    clearTimeout(t.current);
    setToast({ msg, type });
    t.current = setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
};

const Confirm = ({ message, onConfirm, onCancel }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 300,
    }}
  >
    <div
      style={{
        background: "#282828",
        borderRadius: 12,
        padding: 28,
        maxWidth: 380,
        width: "90%",
      }}
    >
      <p style={{ color: "#fff", fontSize: 15, marginBottom: 20 }}>{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "8px 20px",
            background: "#404040",
            border: "none",
            borderRadius: 20,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: "8px 20px",
            background: "#ef4444",
            border: "none",
            borderRadius: 20,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Xoá
        </button>
      </div>
    </div>
  </div>
);

const ArtistModal = ({ artist, onClose, onSaved }) => {
  const isEdit = !!artist;
  const [form, setForm] = useState({
    name: artist?.name ?? "",
    bio: artist?.bio ?? "",
    country: artist?.country ?? "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const imgSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : getImageUrl(artist?.image_url);

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Tên nghệ sĩ không được để trống");
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.bio) fd.append("bio", form.bio);
      if (form.country) fd.append("country", form.country);
      if (imageFile) fd.append("image_file", imageFile);
      const res = isEdit
        ? await adminAPI.updateArtist(artist.artist_id, fd)
        : await adminAPI.createArtist(fd);
      if (res.success) {
        onSaved();
        onClose();
      } else setError(res.message || "Lỗi");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    background: "#333",
    border: "1px solid #444",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#fff",
    fontSize: 13,
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };
  const lbl = {
    color: DIM,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#181818",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          border: "1px solid #282828",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "22px 28px 0",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            {isEdit ? "Sửa nghệ sĩ" : "Thêm nghệ sĩ"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#282828",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              color: DIM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "20px 28px 28px" }}>
          {error && (
            <div
              style={{
                background: "#ef444422",
                border: "1px solid #ef4444",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#ef4444",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* avatar */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 18,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#282828",
                overflow: "hidden",
                border: "2px dashed #444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={28} color="#555" />
              )}
            </div>
            <div>
              <label style={lbl}>Ảnh nghệ sĩ (JPG/PNG, tối đa 5MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ color: DIM, fontSize: 13 }}
              />
              {imageFile && (
                <p style={{ color: GREEN, fontSize: 12, margin: "4px 0 0" }}>
                  ✓ {imageFile.name}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={lbl}>Tên nghệ sĩ *</label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="Nhập tên nghệ sĩ"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Quốc gia</label>
              <input
                value={form.country}
                onChange={set("country")}
                placeholder="Vietnam"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Tiểu sử</label>
              <textarea
                value={form.bio}
                onChange={set("bio")}
                placeholder="Nhập tiểu sử..."
                rows={3}
                style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 20,
            }}
          >
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "9px 22px",
                background: "#333",
                border: "none",
                borderRadius: 20,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "9px 22px",
                background: GREEN,
                border: "none",
                borderRadius: 20,
                color: "#000",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading ? (
                <>
                  <Upload size={14} /> Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle size={14} /> Lưu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toast, show: showToast } = useToast();
  const searchTimer = useRef(null);

  const fetchArtists = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError("");
      try {
        const params = { page: p, limit: 20 };
        if (search) params.search = search;
        const res = await adminAPI.getArtists(params);
        if (res.success) {
          setArtists(res.data);
          setPagination(res.pagination);
        } else setError(res.message || "Lỗi tải dữ liệu");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchArtists(1);
    }, 400);
  }, [search]);
  useEffect(() => {
    fetchArtists(page);
  }, [page]);

  const handleDelete = async (id) => {
    try {
      const res = await adminAPI.deleteArtist(id);
      if (res.success) {
        showToast("Đã xoá nghệ sĩ");
        fetchArtists(page);
      } else showToast(res.message, "error");
    } catch (e) {
      showToast(e.message, "error");
    }
    setConfirm(null);
  };

  const sel = {
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
            Quản lý nghệ sĩ
          </h1>
          <p style={{ margin: "4px 0 0", color: DIM, fontSize: 14 }}>
            {pagination.total} nghệ sĩ
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            background: GREEN,
            border: "none",
            borderRadius: 20,
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <Plus size={16} /> Thêm nghệ sĩ
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
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
            placeholder="Tìm tên nghệ sĩ..."
            style={{
              ...sel,
              paddingLeft: 36,
              width: "100%",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#ef444422",
            border: "1px solid #ef4444",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#ef4444",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 52px 1fr 100px 80px 80px 80px",
              padding: "12px 16px",
              background: "#282828",
              color: DIM,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            <span>#</span>
            <span></span>
            <span>Nghệ sĩ</span>
            <span>Quốc gia</span>
            <span>Bài hát</span>
            <span>Follow</span>
            <span>Hành động</span>
          </div>

          {artists.map((artist, idx) => {
            const imgUrl = getImageUrl(artist.image_url);
            return (
              <div
                key={artist.artist_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 52px 1fr 100px 80px 80px 80px",
                  padding: "10px 16px",
                  borderBottom: "1px solid #282828",
                  alignItems: "center",
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
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#333",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <User size={16} color="#555" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {artist.name}
                  </div>
                  {artist.bio && (
                    <div
                      style={{
                        color: DIM,
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                      }}
                    >
                      {artist.bio}
                    </div>
                  )}
                </div>
                <span style={{ color: DIM, fontSize: 13 }}>
                  {artist.country || "—"}
                </span>
                <span style={{ fontSize: 13 }}>{fmt(artist.total_songs)}</span>
                <span style={{ fontSize: 13 }}>
                  {fmt(artist.follower_count)}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setModal(artist)}
                    title="Sửa"
                    style={{
                      background: "#282828",
                      border: "none",
                      borderRadius: 6,
                      padding: 6,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setConfirm(artist.artist_id)}
                    title="Xoá"
                    style={{
                      background: "#ef444422",
                      border: "none",
                      borderRadius: 6,
                      padding: 6,
                      cursor: "pointer",
                      color: "#ef4444",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {artists.length === 0 && !loading && (
            <p style={{ color: DIM, textAlign: "center", padding: 40 }}>
              Không có nghệ sĩ nào
            </p>
          )}
        </div>
      )}

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
              background: "#282828",
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
              background: "#282828",
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

      {modal && (
        <ArtistModal
          artist={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            showToast(modal === "create" ? "Đã thêm nghệ sĩ" : "Đã cập nhật");
            fetchArtists(page);
          }}
        />
      )}
      {confirm && (
        <Confirm
          message="Xoá nghệ sĩ này?"
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
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
            animation: "fadeUp .2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
};

export default AdminArtists;
