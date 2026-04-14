import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { searchAPI, songAPI, genreAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "../components/LikeButton";
import "./Search.css";

const GENRE_COLORS = [
  "#E13300",
  "#1E3264",
  "#E8115B",
  "#148A08",
  "#E91429",
  "#8D67AB",
  "#7358FF",
  "#D84000",
  "#006450",
  "#8400E7",
  "#AF2896",
  "#1E3264",
];

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const playerContext = useContext(PlayerContext);

  const storePlaySong =
    typeof usePlayerStore === "function"
      ? usePlayerStore((s) => s.playSong)
      : null;

  const playSong =
    playerContext && playerContext.playSong
      ? playerContext.playSong
      : storePlaySong;

  const initialQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fullResults, setFullResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [genres, setGenres] = useState([]);
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await genreAPI.getGenres();
        if (res && res.success) {
          setGenres(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách thể loại:", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.trim()) {
        try {
          const res = await searchAPI.searchAll(debouncedSearchTerm, 5);
          if (res && res.success) {
            const data = res.data || { songs: [], artists: [], albums: [] };

            const songSug = (data.songs || []).map((s) => ({
              type: "song",
              id: s.song_id,
              text: s.title,
              sub: s.artist?.name,
              payload: s,
            }));

            const albumSug = (data.albums || []).map((al) => ({
              type: "album",
              id: al.album_id,
              text: al.title,
              sub: al.artist?.name || al.artist_name,
              payload: al,
            }));

            const artistSug = (data.artists || []).map((a) => ({
              type: "artist",
              id: a.artist_id,
              text: a.name,
              sub: "Nghệ sĩ",
              payload: a,
            }));

            const combined = [...songSug, ...albumSug, ...artistSug].slice(
              0,
              8,
            );
            setSuggestions(combined);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (err) {
          console.error("Lỗi lấy gợi ý:", err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    if (debouncedSearchTerm !== searchParams.get("q")) fetchSuggestions();
  }, [debouncedSearchTerm, searchParams]);

  const fetchFullResults = async (keyword) => {
    if (!keyword || !keyword.trim()) return;
    setIsLoading(true);
    setShowSuggestions(false);
    setError("");
    setSearchParams({ q: keyword });

    try {
      const res = await searchAPI.searchAll(keyword, 5);
      if (res && res.success) {
        setFullResults(
          res.data || { query: keyword, songs: [], artists: [], albums: [] },
        );
      } else {
        setFullResults({ query: keyword, songs: [], artists: [], albums: [] });
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      setError("Có lỗi khi tìm kiếm. Vui lòng thử lại.");
      setFullResults({ query: keyword, songs: [], artists: [], albums: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchFullResults(inputValue);
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) fetchFullResults(q);
  }, []);

  const handleResultClick = async (item, type) => {
    setShowSuggestions(false);

    if (type === "song") {
      const looksLikeSong = item && (item.song_id || item.file_url || item.id);
      if (looksLikeSong && item.file_url) {
        if (typeof playSong === "function") playSong(item);
        else console.warn("playSong is not available");
        return;
      }

      const id = item.song_id || item.id;
      if (id) {
        try {
          const res = await songAPI.getSongById(id);
          if (res && res.success && res.data) {
            if (typeof playSong === "function") playSong(res.data);
            else console.warn("playSong is not available");
            return;
          }
        } catch (err) {
          console.error("Lỗi lấy chi tiết bài hát:", err);
        }
      }

      if (fullResults?.songs?.length) {
        const found = fullResults.songs.find(
          (s) =>
            (item.song_id && s.song_id === item.song_id) ||
            (item.text && s.title === item.text) ||
            (item.title && s.title === item.title),
        );
        if (found) {
          if (typeof playSong === "function") playSong(found);
          else console.warn("playSong is not available");
          return;
        }
      }
      return;
    }

    if (type === "artist") {
      const artistId = item.artist_id || item.id;
      if (artistId) {
        navigate(`/artist/${artistId}`);
        return;
      } else {
        if (item.text || item.sub) {
          await fetchFullResults(item.text || item.sub);
          const first = fullResults?.artists?.[0];
          if (first) navigate(`/artist/${first.artist_id || first.id}`);
        }
        return;
      }
    }

    if (type === "album") {
      const albumId = item.album_id || item.id;
      if (albumId) {
        navigate(`/albums/${albumId}`);
        return;
      } else {
        if (item.text || item.title) {
          await fetchFullResults(item.text || item.title);
          const first = fullResults?.albums?.[0];
          if (first) navigate(`/albums/${first.album_id || first.id}`);
        }
        return;
      }
    }
  };

  return (
    <div className="search-page" style={{ padding: "30px", color: "white" }}>
      {/* KHUNG TÌM KIẾM */}
      <div
        className="search-bar-container"
        style={{
          position: "relative",
          maxWidth: "500px",
          marginBottom: "40px",
        }}
      >
        <div style={{ position: "relative" }}>
          <SearchIcon
            size={24}
            color="#000"
            style={{ position: "absolute", left: "15px", top: "12px" }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bạn muốn nghe gì?"
            style={{
              width: "100%",
              padding: "14px 20px 14px 50px",
              borderRadius: "50px",
              border: "none",
              fontSize: "16px",
              outline: "none",
              color: "black",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* DROPDOWN GỢI Ý */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="suggestions-dropdown"
            style={{
              position: "absolute",
              top: "55px",
              left: "0",
              width: "100%",
              background: "#282828",
              borderRadius: "8px",
              overflow: "hidden",
              zIndex: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            {suggestions.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  handleResultClick(item.payload || item, item.type || "song")
                }
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  borderBottom: "1px solid #333",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: "bold" }}>
                  {item.text}
                </span>
                <span style={{ fontSize: "13px", color: "#b3b3b3" }}>
                  {item.sub}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!inputValue.trim() && !isLoading && !fullResults && (
        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
            Tìm theo thể loại
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {genres.map((genre, index) => (
              <div
                key={genre.genre_id}
                onClick={() => navigate(`/genre/${genre.genre_id}`)}
                style={{
                  background: GENRE_COLORS[index % GENRE_COLORS.length],
                  height: "180px",
                  borderRadius: "8px",
                  padding: "16px",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "bold",
                    wordWrap: "break-word",
                  }}
                >
                  {genre.name}
                </h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KẾT QUẢ TÌM KIẾM */}
      {isLoading ? (
        <h2>Đang tìm kiếm...</h2>
      ) : fullResults ? (
        <div className="full-results">
          {!fullResults.songs?.length &&
          !fullResults.artists?.length &&
          !fullResults.albums?.length ? (
            <h2>Không tìm thấy kết quả cho "{fullResults.query}"</h2>
          ) : (
            <>
              {/* BÀI HÁT */}
              {fullResults.songs && fullResults.songs.length > 0 && (
                <section style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
                    Bài hát
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {fullResults.songs.map((song) => (
                      <div
                        key={song.song_id || song.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          padding: "10px",
                          background: "#181818",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          onClick={() => handleResultClick(song, "song")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            flex: 1,
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={song.cover_url}
                            alt="cover"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "4px",
                            }}
                          />
                          <div>
                            <h4 style={{ margin: 0, fontSize: "16px" }}>
                              {song.title}
                            </h4>
                            <p
                              style={{
                                margin: 0,
                                color: "#b3b3b3",
                                fontSize: "14px",
                              }}
                            >
                              {song.artist?.name}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            paddingRight: "10px",
                          }}
                        >
                          <LikeButton
                            songId={song.song_id}
                            initialIsLiked={song.is_liked}
                            initialLikeCount={song.like_count}
                          />
                          <span style={{ color: "#b3b3b3", fontSize: "14px" }}>
                            {song.duration_formatted}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* NGHỆ SĨ */}
              {fullResults.artists && fullResults.artists.length > 0 && (
                <section style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
                    Nghệ sĩ
                  </h2>
                  <div
                    style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
                  >
                    {fullResults.artists.map((artist) => (
                      <div
                        key={artist.artist_id || artist.id}
                        onClick={() => handleResultClick(artist, "artist")}
                        style={{
                          padding: "20px",
                          background: "#181818",
                          borderRadius: "8px",
                          textAlign: "center",
                          cursor: "pointer",
                          width: "150px",
                        }}
                      >
                        <img
                          src={artist.image_url}
                          alt={artist.name}
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginBottom: "15px",
                          }}
                        />
                        <h4 style={{ margin: 0 }}>{artist.name}</h4>
                        <p
                          style={{
                            margin: "5px 0 0 0",
                            color: "#b3b3b3",
                            fontSize: "13px",
                          }}
                        >
                          Nghệ sĩ
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ALBUM */}
              {fullResults.albums && fullResults.albums.length > 0 && (
                <section>
                  <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
                    Album
                  </h2>
                  <div
                    style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
                  >
                    {fullResults.albums.map((album) => (
                      <div
                        key={album.album_id || album.id}
                        onClick={() => handleResultClick(album, "album")}
                        style={{
                          padding: "20px",
                          background: "#181818",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "150px",
                        }}
                      >
                        <img
                          src={album.cover_url}
                          alt={album.title}
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "8px",
                            objectFit: "cover",
                            marginBottom: "15px",
                          }}
                        />
                        <h4
                          style={{
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {album.title}
                        </h4>
                        <p
                          style={{
                            margin: "5px 0 0 0",
                            color: "#b3b3b3",
                            fontSize: "13px",
                          }}
                        >
                          {album.artist?.name || album.artist_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      ) : null}
      {error && (
        <div style={{ color: "#e91429", marginTop: "16px" }}>{error}</div>
      )}
    </div>
  );
};

export default Search;
