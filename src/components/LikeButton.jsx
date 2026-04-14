import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { songAPI } from "../services/api";

export const LikeButton = ({
  songId,
  initialIsLiked = false,
  initialLikeCount = 0,
}) => {
  const [isLiked, setIsLiked] = useState(Boolean(initialIsLiked));
  const [likeCount, setLikeCount] = useState(Number(initialLikeCount) || 0);
  const [isLiking, setIsLiking] = useState(false);

  // Sync internal state when props change (e.g., currentSong changes)
  useEffect(() => {
    setIsLiked(Boolean(initialIsLiked));
  }, [initialIsLiked]);

  useEffect(() => {
    setLikeCount(Number(initialLikeCount) || 0);
  }, [initialLikeCount]);

  const handleToggleLike = async (e) => {
    // Prevent the click from bubbling to parent row (which triggers play)
    if (e && e.stopPropagation) e.stopPropagation();

    if (isLiking || !songId) return;

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic UI update
    setIsLiked(!previousIsLiked);
    setLikeCount(
      previousIsLiked
        ? Math.max(0, previousLikeCount - 1)
        : previousLikeCount + 1,
    );
    setIsLiking(true);

    try {
      const res = await songAPI.toggleLike(songId);
      if (res && res.success && res.data) {
        // Use server response to ensure consistency
        setIsLiked(Boolean(res.data.is_liked));
        if (res.data.like_count !== undefined) {
          setLikeCount(Number(res.data.like_count));
        }
      } else {
        // If server returns unexpected response, rollback
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
      }
    } catch (error) {
      console.error("Lỗi thả tim:", error);
      // rollback on error
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
      aria-pressed={isLiked}
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

export default LikeButton;
