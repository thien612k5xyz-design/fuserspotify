import React, { useState, useEffect, useRef, useCallback } from "react";
import { adminAPI, genreAPI, songAPI } from "../../services/api";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Music,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";
const GREEN = "#1db954";
const DIM = "#b3b3b3";

/* ---------------- helpers ---------------- */

const fmt = (n) => {
  if (n === null || n === undefined) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const clean = url.replace(/\\/g, "/");
  const finalUrl = clean.startsWith("/") ? clean : `/${clean}`;
  return `${BASE_URL}${finalUrl}`;
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

const useDebounce = (val, delay = 400) => {
  const [dv, setDv] = useState(val);
  useEffect(() => {
    const id = setTimeout(() => setDv(val), delay);
    return () => clearTimeout(id);
  }, [val, delay]);
  return dv;
};

/* ---------------- Confirm dialog ---------------- */

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

/* ---------------- Song Modal (create / edit) ---------------- */
const MOODS = [
  "happy",
  "sad",
  "energetic",
  "chill",
  "romantic",
  "angry",
  "melancholic",
];
const LANGS = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
  { value: "jp", label: "日本語" },
  { value: "other", label: "Khác" },
];

const SongModal = ({ song, genres, artists, onClose, onSaved }) => {
  const isEdit = !!song;

  const safeDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [form, setForm] = useState({
    title: song?.title ?? "",
    artist_id: song?.artist?.artist_id ?? song?.artist_id ?? "",
    album_id: song?.album?.album_id ?? song?.album_id ?? "",
    genre_id: song?.genre?.genre_id ?? song?.genre_id ?? "",
    duration: song?.duration ?? "",
    release_date: safeDate(song?.release_date),
    mood: song?.mood ?? "",
    language: song?.language ?? "vi",
    lyrics: song?.lyrics ?? "",
  });

  const [artistSearch, setArtistSearch] = useState(song?.artist?.name || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      title: song?.title ?? "",
      artist_id: song?.artist?.artist_id ?? song?.artist_id ?? "",
      album_id: song?.album?.album_id ?? song?.album_id ?? "",
      genre_id: song?.genre?.genre_id ?? song?.genre_id ?? "",
      duration: song?.duration ?? "",
      release_date: safeDate(song?.release_date),
      mood: song?.mood ?? "",
      language: song?.language ?? "vi",
      lyrics: song?.lyrics ?? "",
    });
    setArtistSearch(song?.artist?.name || "");
  }, [song]);

  useEffect(() => {
    adminAPI.getAlbums({ limit: 1000 }).then((res) => {
      if (res?.success) setAlbums(res.data);
    });
  }, []);

  useEffect(() => {
    if (form.artist_id && form.album_id && albums.length > 0) {
      const isMatch = albums.some(
        (a) =>
          a.album_id == form.album_id &&
          (a.artist_id == form.artist_id ||
            a.artist?.artist_id == form.artist_id),
      );
      if (!isMatch) {
        setForm((f) => ({ ...f, album_id: "" }));
      }
    }
  }, [form.artist_id, form.album_id, albums]);

  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const coverSrc = coverFile
    ? URL.createObjectURL(coverFile)
    : getImageUrl(song?.cover_url);

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Tên bài hát không được để trống");
    if (!form.artist_id)
      return setError("Vui lòng bấm chọn một Nghệ sĩ từ danh sách gợi ý");
    if (!form.genre_id) return setError("Vui lòng chọn thể loại");
    if (!isEdit && !audioFile) return setError("Vui lòng chọn file nhạc MP3");

    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("artist_id", form.artist_id);
      if (form.album_id) fd.append("album_id", form.album_id);
      fd.append("genre_id", form.genre_id);
      if (form.duration) fd.append("duration", form.duration);
      if (form.release_date) fd.append("release_date", form.release_date);
      if (form.mood) fd.append("mood", form.mood);
      if (form.language) fd.append("language", form.language);
      if (form.lyrics) fd.append("lyrics", form.lyrics);
      if (audioFile) fd.append("audio_file", audioFile);
      if (coverFile) fd.append("cover_image", coverFile);

      const res = isEdit
        ? await adminAPI.updateSong(song.song_id, fd)
        : await adminAPI.createSong(fd);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.message || "Lỗi không xác định");
      }
    } catch (e) {
      setError(e.message || "Lỗi mạng");
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
          maxWidth: 580,
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
            {isEdit ? "Sửa bài hát" : "Thêm bài hát mới"}
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
              {coverSrc ? (
                <img
                  src={coverSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Music size={28} color="#555" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label style={lbl}>Ảnh bìa (JPG/PNG, tối đa 5MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                style={{ color: DIM, fontSize: 13 }}
              />
              {coverFile && (
                <p style={{ color: GREEN, fontSize: 12, margin: "4px 0 0" }}>
                  ✓ {coverFile.name}
                </p>
              )}

              <label style={{ ...lbl, marginTop: 12 }}>
                File nhạc MP3 {!isEdit && "*"}
              </label>
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={(e) => setAudioFile(e.target.files[0])}
                style={{ color: DIM, fontSize: 13 }}
              />
              {audioFile && (
                <p style={{ color: GREEN, fontSize: 12, margin: "4px 0 0" }}>
                  ✓ {audioFile.name} (
                  {(audioFile.size / 1024 / 1024).toFixed(1)}MB)
                </p>
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbl}>Tên bài hát *</label>
              <input
                value={form.title}
                onChange={setField("title")}
                placeholder="Nhập tên bài hát"
                style={inp}
              />
            </div>

            <div style={{ position: "relative", gridColumn: "1/-1" }}>
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

              {showSuggestions &&
                artistSearch &&
                filteredArtists.length > 0 && (
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
                    {filteredArtists.map((a) => (
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
                    ))}
                  </div>
                )}
            </div>

            <div>
              <label style={lbl}>Thuộc Album</label>
              <select
                value={form.album_id}
                onChange={setField("album_id")}
                style={inp}
              >
                <option value="">-- Không thuộc album nào --</option>
                {albums
                  .filter(
                    (a) =>
                      a.artist_id == form.artist_id ||
                      a.artist?.artist_id == form.artist_id,
                  )
                  .map((al) => (
                    <option key={al.album_id} value={al.album_id}>
                      {al.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label style={lbl}>Thể loại *</label>
              <select
                value={form.genre_id}
                onChange={setField("genre_id")}
                style={inp}
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
              <label style={lbl}>Thời lượng (giây)</label>
              <input
                type="number"
                value={form.duration}
                onChange={setField("duration")}
                placeholder="213"
                style={inp}
              />
            </div>

            <div>
              <label style={lbl}>Ngày phát hành</label>
              <input
                type="date"
                value={form.release_date}
                onChange={setField("release_date")}
                style={inp}
              />
            </div>

            <div>
              <label style={lbl}>Mood</label>
              <select value={form.mood} onChange={setField("mood")} style={inp}>
                <option value="">-- Không chọn --</option>
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={lbl}>Ngôn ngữ</label>
              <select
                value={form.language}
                onChange={setField("language")}
                style={inp}
              >
                {LANGS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbl}>Lời bài hát</label>
              <textarea
                value={form.lyrics}
                onChange={setField("lyrics")}
                placeholder="Nhập lời bài hát..."
                rows={4}
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

/* ---------------- AdminSongs main page ---------------- */

const AdminSongs = () => {
  const [allFetchedSongs, setAllFetchedSongs] = useState([]);
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
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();
  const debouncedSearch = useDebounce(search);

  const fetchAllSongsFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSongs({
        page: 1,
        limit: 10000,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(genreFilter && { genre_id: genreFilter }),
        sort: "newest",
      });
      if (res.success) {
        setAllFetchedSongs(res.data);
        setPage(1);
      }
    } catch (e) {
      show(e.message || "Lỗi khi tải danh sách", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genreFilter, show]);

  useEffect(() => {
    fetchAllSongsFromBackend();
  }, [fetchAllSongsFromBackend]);

  useEffect(() => {
    genreAPI.getGenres().then((r) => {
      if (r?.success) setGenres(r.data);
    });
    adminAPI.getArtists({ limit: 10000 }).then((r) => {
      if (r?.success) setArtists(r.data);
    });
  }, []);

  useEffect(() => {
    let processed = [...allFetchedSongs];
    if (sortOption === "oldest") {
      processed.reverse();
    } else if (sortOption === "popular") {
      processed.sort((a, b) => b.play_count - a.play_count);
    } else if (sortOption === "az") {
      processed.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "za") {
      processed.sort((a, b) => b.title.localeCompare(a.title));
    }

    const limit = 20;
    const total = processed.length;
    const total_pages = Math.ceil(total / limit) || 1;
    let currPage = page > total_pages ? total_pages : page;
    const startIdx = (currPage - 1) * limit;
    const endIdx = startIdx + limit;

    setSongs(processed.slice(startIdx, endIdx));
    setPagination({ page: currPage, total_pages, total });
  }, [allFetchedSongs, sortOption, page]);

  const openEdit = async (song) => {
    if (!song.artist || !song.genre) {
      try {
        const res = await adminAPI.getSongById(song.song_id);
        if (res?.success) setModal(res.data);
        else setModal(song);
      } catch {
        setModal(song);
      }
    } else {
      setModal(song);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await adminAPI.deleteSong(id);
      if (res.success) {
        show("Đã xoá bài hát");
        fetchAllSongsFromBackend();
      } else {
        show(res.message || "Xoá thất bại", "error");
      }
    } catch (e) {
      show(e.message || "Lỗi mạng", "error");
    } finally {
      setConfirm(null);
    }
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
            Quản lý bài hát
          </h1>
          <p style={{ margin: "4px 0 0", color: DIM, fontSize: 14 }}>
            {pagination.total} bài hát
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
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
      </div>

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
              ...sel,
              paddingLeft: 36,
              width: "100%",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        <select
          value={genreFilter}
          onChange={(e) => {
            setGenreFilter(e.target.value);
            setPage(1);
          }}
          style={sel}
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
          style={sel}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="popular">Nhiều nghe nhất</option>
          <option value="az">Tên A-Z</option>
          <option value="za">Tên Z-A</option>
        </select>
      </div>

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
              gridTemplateColumns:
                "40px 52px 1fr 130px 90px 60px 70px 85px 80px",
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
            <span>Bài hát</span>
            <span>Thể loại</span>
            <span>Thời lượng</span>
            <span>Plays</span>
            <span>Likes</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {songs.map((song, idx) => {
            const coverUrl = getImageUrl(song.cover_url);
            return (
              <div
                key={song.song_id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "40px 52px 1fr 130px 90px 60px 70px 85px 80px",
                  padding: "10px 16px",
                  borderBottom: "1px solid #282828",
                  alignItems: "center",
                  opacity: song.is_active ? 1 : 0.45,
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
                    <Music size={16} color="#555" />
                  )}
                </div>

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
                    {song.artist?.name || "—"}
                  </div>
                </div>

                <span style={{ color: DIM, fontSize: 12 }}>
                  {song.genre?.name || "—"}
                </span>
                <span style={{ color: DIM, fontSize: 12 }}>
                  {song.duration_formatted || "—"}
                </span>
                <span style={{ fontSize: 13 }}>{fmt(song.play_count)}</span>
                <span style={{ fontSize: 13 }}>{fmt(song.like_count)}</span>

                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: song.is_active ? GREEN : "#ef4444",
                      background: (song.is_active ? GREEN : "#ef4444") + "22",
                      padding: "4px 8px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {song.is_active ? "Hoạt động" : "Đã xoá"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => openEdit(song)}
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
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {songs.length === 0 && (
            <p style={{ color: DIM, textAlign: "center", padding: 40 }}>
              Không có bài hát nào
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
        <SongModal
          song={modal === "create" ? null : modal}
          genres={genres}
          artists={artists}
          onClose={() => setModal(null)}
          onSaved={() => {
            show(modal === "create" ? "Đã thêm bài hát" : "Đã cập nhật");
            fetchAllSongsFromBackend();
          }}
        />
      )}

      {confirm && (
        <Confirm
          message="Xoá bài hát này? (soft delete)"
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

export default AdminSongs;
