// SongLyrics.jsx
import React, { useState } from "react";

const SongLyrics = ({ lyrics }) => {
  const [open, setOpen] = useState(false);
  if (!lyrics)
    return <p style={{ color: "#b3b3b3" }}>Chưa có lời cho bài này.</p>;
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ marginBottom: 8 }}>
        {open ? "Ẩn lời" : "Xem lời"}
      </button>
      {open && (
        <div
          style={{
            maxHeight: 360,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {lyrics}
        </div>
      )}
    </div>
  );
};

export default SongLyrics;
