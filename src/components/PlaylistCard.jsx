import React from "react";
import { BASE_URL } from "../services/api";

const PlaylistCard = ({ playlist, onClick }) => {
  let coverUrl = playlist.cover_url;
  if (!coverUrl) {
    coverUrl = "/default-cover.png";
  } else if (!coverUrl.startsWith("http")) {
    coverUrl = `${BASE_URL}${coverUrl}`;
  }

  return (
    <div className="playlist-card" onClick={onClick}>
      <img
        src={coverUrl}
        alt={playlist.name}
        style={{ width: "100%", borderRadius: "8px" }}
      />
      <h4>{playlist.name}</h4>
      <p>{playlist.total_songs || 0} bài hát</p>
    </div>
  );
};

export default PlaylistCard;
