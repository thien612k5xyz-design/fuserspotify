import React, { useState } from "react";
import { Heart } from "lucide-react";
import { songAPI } from "../services/api";

export const LikeButton = ({
  songId,
  initialIsLiked = false,
  initialLikeCount = 0,
}) => {
  // Trạng thái local để hiển thị ngay lập tức
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // Trạng thái chống click đúp liên tục (spam API)
  const [isLiking, setIsLiking] = useState(false);

  const handleToggleLike = async (e) => {
    // Cực kỳ quan trọng: Ngăn không cho Click lan ra ngoài
    // (Vì nút Like thường nằm trong 1 thẻ <div> có chức năng Click để phát nhạc)
    e.stopPropagation();

    if (isLiking || !songId) return;

    // 1. LƯU LẠI LỊCH SỬ ĐỂ "QUAY XE" NẾU LỖI
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // 2. OPTIMISTIC UPDATE: Lên đồ ngay cho nóng!
    setIsLiked(!previousIsLiked);
    setLikeCount(
      previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
    );
    setIsLiking(true);

    try {
      // 3. GỌI API ÂM THẦM
      const res = await songAPI.toggleLike(songId);

      // (Tùy chọn) Chỉnh lại cho chuẩn 100% khớp với DB trả về nếu cần
      if (res.success && res.data) {
        setIsLiked(res.data.is_liked);
        if (res.data.like_count !== undefined) {
          setLikeCount(res.data.like_count);
        }
      }
    } catch (error) {
      // 4. ROLLBACK: Backend báo lỗi, lật mặt lại như cũ!
      console.error("Lỗi thả tim:", error);
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      // Bạn có thể thêm 1 cái Toast (thông báo) góc màn hình: "Lỗi mạng, vui lòng thử lại"
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
        color: isLiked ? "#1ed760" : "#b3b3b3", // Xanh lá cây Spotify hoặc Xám
        padding: "5px",
        transition: "transform 0.1s ease-in-out",
        transform: isLiking ? "scale(0.8)" : "scale(1)", // Hiệu ứng nẩy nhẹ khi bấm
      }}
    >
      <Heart
        size={20}
        fill={isLiked ? "#1ed760" : "none"} // Bấm thì tô màu đặc bên trong
        color={isLiked ? "#1ed760" : "currentColor"}
      />
      {/* Chỉ hiện số Like nếu có, nếu bằng 0 thì ẩn đi cho gọn */}
      {likeCount > 0 && <span style={{ fontSize: "13px" }}>{likeCount}</span>}
    </button>
  );
};
