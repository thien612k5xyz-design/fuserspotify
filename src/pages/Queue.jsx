import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";

const Queue = () => {
  const { queue, currentIndex, playSong, removeFromQueue } =
    useContext(PlayerContext);

  if (!queue.length)
    return (
      <div style={{ color: "white", padding: "30px" }}>Hàng đợi trống</div>
    );

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h2>Hàng đợi phát</h2>
      {queue.map((song, i) => (
        <div key={song.song_id} style={{ marginBottom: "10px" }}>
          <span style={{ fontWeight: i === currentIndex ? "bold" : "normal" }}>
            {song.title} - {song.artist?.name}
          </span>
          <button onClick={() => playSong(song)}>Phát</button>
          <button onClick={() => removeFromQueue(song.song_id)}>Xóa</button>
        </div>
      ))}
    </div>
  );
};

export default Queue;
