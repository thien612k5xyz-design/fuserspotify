export const BASE_URL = "http://localhost:5000/api";

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

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
    throw new Error(data.message || "Có lỗi xảy từ Server");
  }

  return data;
};

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

export const songAPI = {
  // options: { page, limit, genre_id, artist_id, search, sort }
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

export const playlistAPI = {
  getMyPlaylists: () => fetchWithAuth("/playlists", { method: "GET" }),
  createPlaylist: (data) =>
    fetchWithAuth("/playlists", {
      method: "POST",
      body: JSON.stringify(data),
    }),
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

export const searchAPI = {
  searchAll: (keyword, limit = 5) =>
    fetchWithAuth(`/search?q=${keyword}&limit=${limit}`, {
      method: "GET",
    }),
  getSuggestions: (keyword) =>
    fetchWithAuth(`/search/suggestions?q=${keyword}`, {
      method: "GET",
    }),
};
