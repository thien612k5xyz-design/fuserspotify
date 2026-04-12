import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { searchAPI } from "../services/api";
import { usePlayerStore } from "../store/usePlayerStore";
import { LikeButton } from "../components/LikeButton";
import "./Search.css";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const playSong = usePlayerStore((state) => state.playSong);

  const initialQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fullResults, setFullResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(inputValue, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.trim()) {
        try {
          const res = await searchAPI.getSuggestions(debouncedSearchTerm);
          if (res.success) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Lỗi lấy gợi ý:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    if (debouncedSearchTerm !== searchParams.get("q")) fetchSuggestions();
  }, [debouncedSearchTerm, searchParams]);

  const fetchFullResults = async (keyword) => {
    if (!keyword.trim()) return;
    setIsLoading(true);
    setShowSuggestions(false);
    setSearchParams({ q: keyword });

    try {
      const res = await searchAPI.searchAll(keyword, 5);
      if (res.success) setFullResults(res.data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
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

  const handleResultClick = (item, type) => {
    setShowSuggestions(false);
    if (type === "song") playSong(item);
    else if (type === "artist")
      navigate(`/artist/${item.artist_id || item.id}`);
    else if (type === "album") navigate(`/album/${item.album_id || item.id}`);
  };

  return (
    <div className="search-page" style={{ padding: "30px", color: "white" }}>
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
                onClick={() => handleResultClick(item, item.type || "song")}
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  borderBottom: "1px solid #333",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: "bold" }}>
                  {item.text || item.title}
                </span>
                <span style={{ fontSize: "13px", color: "#b3b3b3" }}>
                  {item.sub || item.artist?.name || item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <h2>Đang tìm kiếm...</h2>
      ) : fullResults ? (
        <div className="full-results">
          {!fullResults.songs?.length && !fullResults.artists?.length ? (
            <h2>Không tìm thấy kết quả cho "{fullResults.query}"</h2>
          ) : (
            <>
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
                        key={song.song_id}
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

                        {/* NÚT THẢ TIM*/}
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

              {fullResults.artists && fullResults.artists.length > 0 && (
                <section>
                  <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
                    Nghệ sĩ
                  </h2>
                  <div style={{ display: "flex", gap: "20px" }}>
                    {fullResults.artists.map((artist) => (
                      <div
                        key={artist.artist_id}
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
            </>
          )}
        </div>
      ) : (
        <div style={{ color: "#b3b3b3", marginTop: "50px" }}>
          <h2>Tìm kiếm bài hát, nghệ sĩ hoặc podcast</h2>
        </div>
      )}
    </div>
  );
};

export default Search;
