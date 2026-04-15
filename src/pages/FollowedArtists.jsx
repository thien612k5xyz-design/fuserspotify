import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { artistAPI } from "../services/api";
import { Users, RefreshCw } from "lucide-react";

const FollowedArtists = () => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFollowedArtists = async () => {
    setIsLoading(true);
    try {
      const query = "?page=1&limit=100";
      const res = await artistAPI.getArtists(query);
      let allArtists = [];
      if (res == null) {
        allArtists = [];
      } else if (res.success && res.data) {
        if (Array.isArray(res.data)) allArtists = res.data;
        else if (Array.isArray(res.data.data)) allArtists = res.data.data;
        else if (Array.isArray(res.data.items)) allArtists = res.data.items;
        else allArtists = [];
      } else if (Array.isArray(res)) {
        allArtists = res;
      } else if (Array.isArray(res.data)) {
        allArtists = res.data;
      } else {
        allArtists = [];
      }

      // Filter only followed artists
      const followedOnly = Array.isArray(allArtists)
        ? allArtists.filter((artist) => artist.is_following === true)
        : [];

      setArtists(followedOnly);
    } catch (err) {
      console.error("Lỗi tải danh sách nghệ sĩ:", err);
      setArtists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowedArtists();
  }, []);

  if (isLoading)
    return (
      <div style={{ padding: "30px", color: "white" }}>
        Đang tải danh sách theo dõi...
      </div>
    );

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "900",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
          }}
        >
          <Users size={32} color="#1db954" /> Nghệ sĩ đã theo dõi
        </h1>

        <button
          onClick={fetchFollowedArtists}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "transparent",
            border: "1px solid #b3b3b3",
            color: "#b3b3b3",
            padding: "8px 16px",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {artists.length === 0 ? (
        <p style={{ color: "#b3b3b3", fontSize: "16px" }}>
          Bạn chưa theo dõi nghệ sĩ nào.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "24px",
          }}
        >
          {artists.map((artist) => (
            <div
              key={artist.artist_id || artist.id}
              onClick={() =>
                navigate(`/artist/${artist.artist_id || artist.id}`)
              }
              style={{
                background: "#181818",
                padding: "20px",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "center",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#282828")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#181818")
              }
            >
              <img
                src={
                  artist.image_url ||
                  artist.avatar_url ||
                  artist.cover_url ||
                  "/default-avatar.png"
                }
                alt={artist.name}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "15px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {artist.name}
              </h3>
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "14px",
                  color: "#b3b3b3",
                }}
              >
                Nghệ sĩ
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowedArtists;
