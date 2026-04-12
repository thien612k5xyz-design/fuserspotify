const BASE_URL = "http://localhost:5000/api";

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("spotify_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Có lỗi xảy ra từ Server");
  }
  return data;
};

// XÁC THỰC , USER PROFILE

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

export const userAPI = {
  // THÔNG TIN CÁ NHÂN 
  getProfile: () => fetchWithAuth("/users/profile", { method: "GET" }),

  updateProfile: (data) =>
    fetchWithAuth("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (file) => {
    const token = localStorage.getItem("spotify_token");
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("http://localhost:5000/api/users/avatar", {
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

  // THỐNG KÊ CHI TIẾT 
  getStats: (period = "all", month = "", year = "") =>
    fetchWithAuth(`/user/stats?period=${period}&month=${month}&year=${year}`, {
      method: "GET",
    }),

  getGenreDistribution: (period = "all", month = "", year = "") =>
    fetchWithAuth(
      `/user/genre-distribution?period=${period}&month=${month}&year=${year}`,
      { method: "GET" },
    ),

  getTopTracks: (limit = 5) =>
    fetchWithAuth(`/user/top-tracks?limit=${limit}`, {
      method: "GET",
    }),
};

// BÀI HÁT

export const songAPI = {
  // Lấy danh sách bài hát
  getSongs: (queryString = "") =>
    fetchWithAuth(`/songs${queryString}`, { method: "GET" }),

  // Lấy chi tiết bài hát
  getSongById: (id) => fetchWithAuth(`/songs/${id}`, { method: "GET" }),

  // Ghi nhận lịch sử nghe nhạc
  recordPlay: (id, playData) =>
    fetchWithAuth(`/songs/${id}/play`, {
      method: "POST",
      body: JSON.stringify(playData),
    }),

  // Thích/Bỏ thích bài hát
  toggleLike: (id) => fetchWithAuth(`/songs/${id}/like`, { method: "POST" }),

  // Lấy danh sách bài đã thích
  getLikedSongs: (page = 1, limit = 20) =>
    fetchWithAuth(`/songs/liked?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  // Lấy danh sách bài vừa nghe
  getRecentSongs: () => fetchWithAuth("/songs/recent", { method: "GET" }),
};

// NGHỆ SĨ, ALBUM , THỂ LOẠI

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

export const albumAPI = {
  getAlbumById: (id) => fetchWithAuth(`/albums/${id}`, { method: "GET" }),
};

export const genreAPI = {
  getGenres: () => fetchWithAuth("/genres", { method: "GET" }),
  getGenreSongs: (id, queryString = "") =>
    fetchWithAuth(`/genres/${id}/songs${queryString}`, { method: "GET" }),
};

// PLAYLISTS

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

// SEARCH

export const searchAPI = {
  searchAll: (keyword, limit = 5) =>
    fetchWithAuth(`/search?q=${keyword}&limit=${limit}`, { method: "GET" }),
  getSuggestions: (keyword) =>
    fetchWithAuth(`/search/suggestions?q=${keyword}`, { method: "GET" }),
};
