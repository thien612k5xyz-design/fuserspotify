import React, { useState, useEffect, useRef, useContext } from "react";
import { adminAPI, genreAPI, artistAPI } from "../../services/api";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  CheckCircle,
} from "lucide-react";

const GREEN = "#1db954";
const DIM = "#b3b3b3";

// ── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const show = (msg, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
};

// ── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
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

// ── Song Modal (Create / Edit) ────────────────────────────────────────────────
const SongModal = ({ song, genres, artists, onClose, onSaved }) => {
  const isEdit = !!song;
  const [form, setForm] = useState({
    title: song?.title || "",
    artist_id: song?.artist?.artist_id || "",
    album_id: song?.album?.album_id || "",
    genre_id: song?.genre?.genre_id || "",
    duration: song?.duration || "",
    release_date: song?.release_date ? song.release_date.split("T")[0] : "",
    mood: song?.mood || "",
    language: song?.language || "vi",
    lyrics: song?.lyrics || "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const coverPreview = coverFile
    ? URL.createObjectURL(coverFile)
    : song?.cover_url || null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.artist_id || !form.genre_id) {
      setError("Vui lòng điền đầy đủ: Tên bài hát, Nghệ sĩ, Thể loại");
      return;
    }
    if (!isEdit && !audioFile) {
      setError("Vui lòng chọn file nhạc MP3");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") fd.append(k, v);
      });
      if (audioFile) fd.append("audio_file", audioFile);
      if (coverFile) fd.append("cover_image", coverFile);

      const res = isEdit
        ? await adminAPI.updateSong(song.song_id, fd)
        : await adminAPI.createSong(fd);

      if (res.success) {
        onSaved();
        onClose();
      } else setError(res.message || "Lỗi không xác định");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#333",
    border: "1px solid #444",
    borderRadius: 6,
    padding: "9px 12px",
    color: "#fff",
    fontSize: 13,
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    color: DIM,
    fontSize: 12,
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#181818",
          borderRadius: 14,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
          border: "1px solid #282828",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {isEdit ? "✏️ Sửa bài hát" : "➕ Thêm bài hát mới"}
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

        {error && (
          <div
            style={{
              background: "#ef444422",
              border: "1px solid #ef4444",
              borderRadius: 6,
              padding: "8px 12px",
              color: "#ef4444",
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Cover preview + upload */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 18,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 8,
              background: "#282828",
              flexShrink: 0,
              overflow: "hidden",
              border: "2px dashed #444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Music size={28} color="#555" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ảnh bìa (JPG/PNG, tối đa 5MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              style={{ color: DIM, fontSize: 13 }}
            />
            <label style={{ ...labelStyle, marginTop: 12 }}>
              File nhạc MP3 {!isEdit && "*"}
            </label>
            <input
              type="file"
              accept="audio/mp3,audio/mpeg"
              onChange={(e) => setAudioFile(e.target.files[0])}
              style={{ color: DIM, fontSize: 13 }}
            />
            {audioFile && (
              <p style={{ color: GREEN, fontSize: 12, marginTop: 4 }}>
                ✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)}
                MB)
              </p>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Tên bài hát *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Nhập tên bài hát"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Nghệ sĩ *</label>
            <select
              value={form.artist_id}
              onChange={(e) => set("artist_id", e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Chọn nghệ sĩ --</option>
              {artists.map((a) => (
                <option key={a.artist_id} value={a.artist_id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Thể loại *</label>
            <select
              value={form.genre_id}
              onChange={(e) => set("genre_id", e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Chọn thể loại --</option>
              {genres.map((g) => (
                <option key={g.genre_id || g.id} value={g.genre_id || g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Thời lượng (giây)</label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              placeholder="213"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Ngày phát hành</label>
            <input
              type="date"
              value={form.release_date}
              onChange={(e) => set("release_date", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Mood</label>
            <select
              value={form.mood}
              onChange={(e) => set("mood", e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Không chọn --</option>
              {["happy", "sad", "energetic", "chill", "romantic", "angry"].map(
                (m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Ngôn ngữ</label>
            <select
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
              style={inputStyle}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="jp">日本語</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Lời bài hát</label>
            <textarea
              value={form.lyrics}
              onChange={(e) => set("lyrics", e.target.value)}
              placeholder="Nhập lời bài hát..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Actions */}
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
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [modal, setModal] = useState(null); // null | "create" | song object
  const [confirm, setConfirm] = useState(null); // null | song id
  const { toast, show: showToast } = useToast();
  const searchTimer = useRef(null);

  const fetchSongs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getSongs({
        page: p,
        limit: 20,
        search: search || undefined,
        genre_id: genreFilter || undefined,
        sort: sortOption,
      });
      if (res.success) {
        setSongs(res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Load genres + artists một lần
  useEffect(() => {
    genreAPI.getGenres().then((r) => {
      if (r?.success) setGenres(r.data);
    });
    adminAPI.getArtists({ limit: 200 }).then((r) => {
      if (r?.success) setArtists(r.data);
    });
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchSongs(1);
    }, 400);
  }, [search, genreFilter, sortOption]);

  useEffect(() => {
    fetchSongs(page);
  }, [page]);

  const handleDelete = async (id) => {
    try {
      const res = await adminAPI.deleteSong(id);
      if (res.success) {
        showToast("Đã xoá bài hát");
        fetchSongs(page);
      } else showToast(res.message, "error");
    } catch (e) {
      showToast(e.message, "error");
    }
    setConfirm(null);
  };

  const fmt = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
    return String(n ?? 0);
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
            Quản lý bài hát
          </h1>
          <p style={{ margin: "4px 0 0", color: DIM, fontSize: 14 }}>
            {pagination.total} bài hát
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
          <Plus size={16} /> Thêm bài hát
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
            placeholder="Tìm tên bài hát, nghệ sĩ..."
            style={{
              ...selectStyle,
              paddingLeft: 36,
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 8,
            }}
          />
        </div>

        <select
          value={genreFilter}
          onChange={(e) => {
            setGenreFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="">Tất cả thể loại</option>
          {genres.map((g) => (
            <option key={g.genre_id || g.id} value={g.genre_id || g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="popular">Nhiều nghe nhất</option>
          <option value="title">Tên A-Z</option>
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
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "40px 52px 1fr 140px 90px 70px 70px 90px 80px",
              padding: "12px 16px",
              background: "#282828",
              color: DIM,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            <span>#</span>
            <span></span>
            <span>Bài hát</span>
            <span>Thể loại</span>
            <span>Thời lượng</span>
            <span>Plays</span>
            <span>Likes</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {songs.map((song, idx) => (
            <div
              key={song.song_id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "40px 52px 1fr 140px 90px 70px 70px 90px 80px",
                padding: "10px 16px",
                borderBottom: "1px solid #282828",
                alignItems: "center",
                opacity: song.is_active ? 1 : 0.45,
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
              <div style={{ minWidth: 0 }}>
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
              <span style={{ color: DIM, fontSize: 12 }}>
                {song.genre?.name || "—"}
              </span>
              <span style={{ color: DIM, fontSize: 12 }}>
                {song.duration_formatted}
              </span>
              <span style={{ fontSize: 13 }}>{fmt(song.play_count)}</span>
              <span style={{ fontSize: 13 }}>{fmt(song.like_count)}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: song.is_active ? GREEN : "#ef4444",
                  background: (song.is_active ? GREEN : "#ef4444") + "22",
                  padding: "3px 8px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}
              >
                {song.is_active ? "Hoạt động" : "Đã xoá"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setModal(song)}
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
                  <Pencil size={14} />
                </button>
                {song.is_active && (
                  <button
                    onClick={() => setConfirm(song.song_id)}
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
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {songs.length === 0 && (
            <p style={{ color: DIM, textAlign: "center", padding: 40 }}>
              Không có bài hát nào
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

      {/* Modals */}
      {modal && (
        <SongModal
          song={modal === "create" ? null : modal}
          genres={genres}
          artists={artists}
          onClose={() => setModal(null)}
          onSaved={() => {
            showToast(modal === "create" ? "Đã thêm bài hát" : "Đã cập nhật");
            fetchSongs(page);
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message="Bạn chắc chắn muốn xoá bài hát này? (Soft delete — có thể khôi phục)"
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
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

export default AdminSongs;
