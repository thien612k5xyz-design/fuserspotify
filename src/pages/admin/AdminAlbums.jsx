import React, { useState, useEffect, useRef, useCallback } from "react";
import { adminAPI } from "../../services/api";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Disc3,
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
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

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

// ── Album Modal ───────────────────────────────────────────────────────────────
const AlbumModal = ({ album, artists, onClose, onSaved }) => {
  const isEdit = !!album;
  const [form, setForm] = useState({
    title: album?.title ?? "",
    artist_id: album?.artist?.artist_id ?? "",
    release_date: album?.release_date
      ? new Date(album.release_date).toISOString().split("T")[0]
      : "",
    description: album?.description ?? "",
  });
  const [artistSearch, setArtistSearch] = useState(album?.artist?.name ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const coverSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : getImageUrl(album?.cover_url);

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Tên album không được để trống");
    if (!form.artist_id)
      return setError("Vui lòng chọn nghệ sĩ từ danh sách gợi ý");

    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("artist_id", form.artist_id);
      if (form.release_date) fd.append("release_date", form.release_date);
      if (form.description) fd.append("description", form.description);
      if (imageFile) fd.append("image_file", imageFile);

      const res = isEdit
        ? await adminAPI.updateAlbum(album.album_id, fd)
        : await adminAPI.createAlbum(fd);

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
          maxWidth: 500,
          maxHeight: "92vh",
          overflowY: "auto",
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
            {isEdit ? "Sửa album" : "Thêm album"}
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

          {/* Cover */}
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
                borderRadius: 8,
                background: "#282828",
                overflow: "hidden",
                border: "2px dashed #444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {coverSrc ? (
                <img
                  src={coverSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Disc3 size={28} color="#555" />
              )}
            </div>
            <div>
              <label style={lbl}>Ảnh bìa album (JPG/PNG, tối đa 5MB)</label>
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
            {/* Title */}
            <div>
              <label style={lbl}>Tên album *</label>
              <input
                value={form.title}
                onChange={set("title")}
                placeholder="Nhập tên album"
                style={inp}
              />
            </div>

            {/* Artist autocomplete */}
            <div style={{ position: "relative" }}>
              <label style={lbl}>Nghệ sĩ *</label>
              <input
                type="text"
                placeholder="Nhập và chọn tên nghệ sĩ..."
                style={inp}
                value={artistSearch}
                onChange={(e) => {
                  setArtistSearch(e.target.value);
                  setForm((f) => ({ ...f, artist_id: "" }));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {/* Hiển thị đã chọn */}
              {form.artist_id && (
                <p style={{ color: GREEN, fontSize: 12, margin: "4px 0 0" }}>
                  ✓ Đã chọn: {artistSearch}
                </p>
              )}
              {/* Dropdown gợi ý */}
              {showSuggestions && artistSearch && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#282828",
                    border: "1px solid #444",
                    borderRadius: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                    zIndex: 10,
                    marginTop: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  }}
                >
                  {filteredArtists.length > 0 ? (
                    filteredArtists.map((a) => (
                      <div
                        key={a.artist_id}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: 13,
                          borderBottom: "1px solid #333",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#3e3e3e")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        onClick={() => {
                          setArtistSearch(a.name);
                          setForm((f) => ({ ...f, artist_id: a.artist_id }));
                          setShowSuggestions(false);
                        }}
                      >
                        {a.name}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{ padding: "10px 12px", color: DIM, fontSize: 13 }}
                    >
                      Không tìm thấy nghệ sĩ...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Release date */}
            <div>
              <label style={lbl}>Ngày phát hành</label>
              <input
                type="date"
                value={form.release_date}
                onChange={set("release_date")}
                style={inp}
              />
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Mô tả</label>
              <textarea
                value={form.description}
                onChange={set("description")}
                placeholder="Nhập mô tả album..."
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

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
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

  const fetchAlbums = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError("");
      try {
        const params = { page: p, limit: 20 };
        if (search) params.search = search;
        const res = await adminAPI.getAlbums(params);
        if (res.success) {
          setAlbums(res.data);
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

  // Load artists để dùng autocomplete
  useEffect(() => {
    adminAPI
      .getArtists({ limit: 10000 })
      .then((r) => {
        if (r?.success) setArtists(r.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchAlbums(1);
    }, 400);
  }, [search]);

  useEffect(() => {
    fetchAlbums(page);
  }, [page]);

  const handleDelete = async (id) => {
    try {
      const res = await adminAPI.deleteAlbum(id);
      if (res.success) {
        showToast("Đã xoá album");
        fetchAlbums(page);
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
            Quản lý album
          </h1>
          <p style={{ margin: "4px 0 0", color: DIM, fontSize: 14 }}>
            {pagination.total} album
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
          <Plus size={16} /> Thêm album
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
            placeholder="Tìm tên album..."
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
              gridTemplateColumns: "40px 52px 1fr 150px 80px 110px 80px",
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
            <span>Album</span>
            <span>Nghệ sĩ</span>
            <span>Tracks</span>
            <span>Phát hành</span>
            <span>Hành động</span>
          </div>

          {albums.map((album, idx) => {
            const coverUrl = getImageUrl(album.cover_url);
            return (
              <div
                key={album.album_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 52px 1fr 150px 80px 110px 80px",
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
                    borderRadius: 4,
                    background: "#333",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
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
                    <Disc3 size={16} color="#555" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {album.title}
                  </div>
                  {album.description && (
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
                      {album.description}
                    </div>
                  )}
                </div>
                <span style={{ color: DIM, fontSize: 13 }}>
                  {album.artist?.name || "—"}
                </span>
                <span style={{ fontSize: 13 }}>
                  {album.total_tracks ?? 0} bài
                </span>
                <span style={{ color: DIM, fontSize: 13 }}>
                  {fmtDate(album.release_date)}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setModal(album)}
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
                    onClick={() => setConfirm(album.album_id)}
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

          {albums.length === 0 && !loading && (
            <p style={{ color: DIM, textAlign: "center", padding: 40 }}>
              Không có album nào
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
        <AlbumModal
          album={modal === "create" ? null : modal}
          artists={artists}
          onClose={() => setModal(null)}
          onSaved={() => {
            showToast(modal === "create" ? "Đã thêm album" : "Đã cập nhật");
            fetchAlbums(page);
          }}
        />
      )}

      {confirm && (
        <Confirm
          message="Xoá album này?"
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

export default AdminAlbums;
