import React, { useEffect, useState } from "react";
import { userAPI } from "../services/api";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await userAPI.getStats("month");
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Lỗi tải Stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading)
    return <div style={{ color: "white" }}>Đang tải thống kê...</div>;
  if (!stats) return <div style={{ color: "white" }}>Không có dữ liệu</div>;

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h2>
        Thống kê tháng {stats.period?.month}/{stats.period?.year}
      </h2>
      <p>Tổng lượt nghe: {stats.summary?.total_plays}</p>
      <p>Số bài hát khác nhau: {stats.summary?.total_unique_songs}</p>
      <p>Tổng giờ nghe: {stats.summary?.total_hours}</p>
      <p>Số lượt thích: {stats.summary?.total_likes}</p>
      <p>Số playlist: {stats.summary?.total_playlists}</p>
      <h3>Thể loại yêu thích: {stats?.top_genre?.name || "Chưa đủ dữ liệu"}</h3>
      <p>{stats?.community_comparison?.label || "Chưa có thống kê"}</p>
    </div>
  );
};

export default Stats;
