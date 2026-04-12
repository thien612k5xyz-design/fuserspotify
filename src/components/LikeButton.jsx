import React, { useState } from "react";
import { Heart } from "lucide-react";
import { songAPI } from "../services/api";

export const LikeButton = ({
  songId,
  initialIsLiked = false,
  initialLikeCount = 0,
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleToggleLike = async (e) => {
    e.stopPropagation();

    if (isLiking || !songId) return;

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(
      previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
    );
    setIsLiking(true);

    try {
      const res = await songAPI.toggleLike(songId);
      if (res.success && res.data) {
        setIsLiked(res.data.is_liked);
        if (res.data.like_count !== undefined) {
          setLikeCount(res.data.like_count);
        }
      }
    } catch (error) {
      console.error("Lỗi thả tim:", error);
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      title={isLiked ? "Bỏ thích" : "Lưu vào Thư viện"}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: isLiked ? "#1ed760" : "#b3b3b3",
        padding: "5px",
        transition: "transform 0.1s ease-in-out",
        transform: isLiking ? "scale(0.8)" : "scale(1)",
      }}
    >
      <Heart
        size={20}
        fill={isLiked ? "#1ed760" : "none"}
        color={isLiked ? "#1ed760" : "currentColor"}
      />
      {likeCount > 0 && <span style={{ fontSize: "13px" }}>{likeCount}</span>}
    </button>
  );
};
