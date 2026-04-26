export const BASE_URL = "http://localhost:5000/api";

// ── fetch thường (JSON) ────────────────────────────────────────────
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Có lỗi xảy ra từ Server");
  return data;
};

// ── fetch multipart/form-data (upload file) ───────────────────────
const fetchWithAuthForm = async (endpoint, formData, method = "POST") => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi server");
  return data;
};

// =================================================================
// ADMIN API
// =================================================================
export const adminAPI = {
  // ── Overview & Analytics ────────────────────────────────────────
  getOverview: () => fetchWithAuth("/admin/overview"),
  getMusicAnalytics: (period = "week") =>
    fetchWithAuth(`/admin/music/analytics?period=${period}`),
  getUserAnalytics: () => fetchWithAuth("/admin/users/analytics"),
  getRevenueAnalytics: () => fetchWithAuth("/admin/revenue/analytics"),

  // ── Songs ────────────────────────────────────────────────────────
  getSongs: (params = {}) =>
    fetchWithAuth(`/admin/songs?${new URLSearchParams(params)}`),
  createSong: (fd) => fetchWithAuthForm("/admin/songs", fd),
  updateSong: (id, fd) => fetchWithAuthForm(`/admin/songs/${id}`, fd, "PATCH"),
  deleteSong: (id) => fetchWithAuth(`/admin/songs/${id}`, { method: "DELETE" }),

  // ── Artists ──────────────────────────────────────────────────────
  getArtists: (params = {}) =>
    fetchWithAuth(`/admin/artists?${new URLSearchParams(params)}`),
  createArtist: (fd) => fetchWithAuthForm("/admin/artists", fd),
  updateArtist: (id, fd) =>
    fetchWithAuthForm(`/admin/artists/${id}`, fd, "PATCH"),
  deleteArtist: (id) =>
    fetchWithAuth(`/admin/artists/${id}`, { method: "DELETE" }),

  // ── Albums ───────────────────────────────────────────────────────
  getAlbums: (params = {}) =>
    fetchWithAuth(`/admin/albums?${new URLSearchParams(params)}`),
  createAlbum: (fd) => fetchWithAuthForm("/admin/albums", fd),
  updateAlbum: (id, fd) =>
    fetchWithAuthForm(`/admin/albums/${id}`, fd, "PATCH"),
  deleteAlbum: (id) =>
    fetchWithAuth(`/admin/albums/${id}`, { method: "DELETE" }),

  // ── Users ────────────────────────────────────────────────────────
  getUsers: (params = {}) =>
    fetchWithAuth(`/admin/users?${new URLSearchParams(params)}`),
  getUserDetail: (id) => fetchWithAuth(`/admin/users/${id}`),
  updateRole: (id, role) =>
    fetchWithAuth(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  updatePlan: (id, plan) =>
    fetchWithAuth(`/admin/users/${id}/plan`, {
      method: "PATCH",
      body: JSON.stringify({ plan }),
    }),
  blockUser: (id, is_active) =>
    fetchWithAuth(`/admin/users/${id}/block`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    }),
};

// =================================================================
// AUTH API
// =================================================================
export const authAPI = {
  login: (credentials) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  logout: () => fetchWithAuth("/auth/logout", { method: "POST" }),
  getMe: () => fetchWithAuth("/auth/me", { method: "GET" }),
  changePassword: (data) =>
    fetchWithAuth("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// =================================================================
// USER API
// =================================================================
export const userAPI = {
  getProfile: () => fetchWithAuth("/users/profile", { method: "GET" }),
  updateProfile: (data) =>
    fetchWithAuth("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  uploadAvatar: async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch(`${BASE_URL}/users/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi upload ảnh");
    return data;
  },
  upgradePremium: (planData) =>
    fetchWithAuth("/users/upgrade", {
      method: "POST",
      body: JSON.stringify(planData),
    }),
  getStats: (period = "all", month = "", year = "") =>
    fetchWithAuth(`/user/stats?period=${period}&month=${month}&year=${year}`, {
      method: "GET",
    }),
  getGenreDistribution: (period = "all", month = "", year = "") =>
    fetchWithAuth(
      `/user/genre-distribution?period=${period}&month=${month}&year=${year}`,
      { method: "GET" },
    ),
};

// =================================================================
// SONG API
// =================================================================
export const songAPI = {
  getSongs: async (options = {}) => {
    const { page = 1, limit = 20, genre_id, artist_id, search, sort } = options;
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (genre_id !== undefined && genre_id !== null)
      params.append("genre_id", genre_id);
    if (artist_id !== undefined && artist_id !== null)
      params.append("artist_id", artist_id);
    if (search) params.append("search", search);
    if (sort) params.append("sort", sort);
    return fetchWithAuth(`/songs?${params.toString()}`, { method: "GET" });
  },
  getSongById: (id) => fetchWithAuth(`/songs/${id}`, { method: "GET" }),
  getHome: () => fetchWithAuth(`/home`, { method: "GET" }),
  recordPlay: (id, playData) =>
    fetchWithAuth(`/songs/${id}/play`, {
      method: "POST",
      body: JSON.stringify(playData),
    }),
  toggleLike: (id) => fetchWithAuth(`/songs/${id}/like`, { method: "POST" }),
  getLikedSongs: (page = 1, limit = 20) =>
    fetchWithAuth(`/songs/liked?page=${page}&limit=${limit}`, {
      method: "GET",
    }),
  getRecentSongs: () => fetchWithAuth("/songs/recent", { method: "GET" }),
  stream: (id) => `${BASE_URL}/songs/${id}/stream`,
};

// =================================================================
// ARTIST API
// =================================================================
export const artistAPI = {
  getArtists: (queryString = "") =>
    fetchWithAuth(`/artists${queryString}`, { method: "GET" }),
  getArtistById: (id) => fetchWithAuth(`/artists/${id}`, { method: "GET" }),
  getArtistSongs: (id, sort = "popular") =>
    fetchWithAuth(`/artists/${id}/songs?sort=${sort}`, { method: "GET" }),
  getArtistAlbums: (id) =>
    fetchWithAuth(`/artists/${id}/albums`, { method: "GET" }),
  toggleFollow: (id) =>
    fetchWithAuth(`/artists/${id}/follow`, { method: "POST" }),
};

// =================================================================
// ALBUM API
// =================================================================
export const albumAPI = {
  getAlbumById: (id) => fetchWithAuth(`/albums/${id}`, { method: "GET" }),
};

// =================================================================
// GENRE API
// =================================================================
export const genreAPI = {
  getGenres: () => fetchWithAuth("/genres", { method: "GET" }),
  getGenreSongs: (id, queryString = "") =>
    fetchWithAuth(`/genres/${id}/songs${queryString}`, { method: "GET" }),
};

// =================================================================
// PLAYLIST API
// =================================================================
export const playlistAPI = {
  getMyPlaylists: () => fetchWithAuth("/playlists", { method: "GET" }),
  createPlaylist: (data) =>
    fetchWithAuth("/playlists", { method: "POST", body: JSON.stringify(data) }),
  getPlaylistById: (id) => fetchWithAuth(`/playlists/${id}`, { method: "GET" }),
  updatePlaylist: (id, data) =>
    fetchWithAuth(`/playlists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deletePlaylist: (id) =>
    fetchWithAuth(`/playlists/${id}`, { method: "DELETE" }),
  addSongToPlaylist: (playlistId, songId) =>
    fetchWithAuth(`/playlists/${playlistId}/songs`, {
      method: "POST",
      body: JSON.stringify({ song_id: songId }),
    }),
  removeSongFromPlaylist: (playlistId, songId) =>
    fetchWithAuth(`/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
    }),
};

// =================================================================
// SEARCH API
// =================================================================
export const searchAPI = {
  searchAll: (keyword, limit = 5) =>
    fetchWithAuth(`/search?q=${keyword}&limit=${limit}`, { method: "GET" }),
  getSuggestions: (keyword) =>
    fetchWithAuth(`/search/suggestions?q=${keyword}`, { method: "GET" }),
};
