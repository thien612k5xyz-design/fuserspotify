import React, { useState } from "react";
import {
  Camera,
  CheckCircle,
  Clock,
  Music,
  Heart,
  BarChart2,
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPremium, setIsPremium] = useState(false);

  const chartData = [
    { day: "T2", hours: 2, height: "30%" },
    { day: "T3", hours: 3.5, height: "50%" },
    { day: "T4", hours: 1, height: "15%" },
    { day: "T5", hours: 5, height: "80%" },
    { day: "T6", hours: 4, height: "60%" },
    { day: "T7", hours: 7, height: "100%" },
    { day: "CN", hours: 6, height: "85%" },
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img
            src="https://arknights.wiki.gg/wiki/Togawa_Sakiko#/media/File:Togawa_Sakiko_Skin_1.png"
            alt="avatar"
          />
          <button className="avatar-upload-btn" title="Đổi ảnh đại diện">
            <Camera size={18} />
          </button>
        </div>
        <div className="user-info">
          <h1>Giau ten</h1>
          <p>a@gmail.com</p>
          {isPremium ? (
            <span className="badge-premium">Premium (Hết hạn: 12/2026)</span>
          ) : (
            <span
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                display: "block",
              }}
            >
              Tài khoản Free
            </span>
          )}
        </div>
      </div>

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Thống kê cá nhân
        </button>
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Chỉnh sửa Hồ sơ
        </button>
        <button
          className={`tab-btn ${activeTab === "premium" ? "active" : ""}`}
          onClick={() => setActiveTab("premium")}
        >
          Gói Premium
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="tab-content fade-in">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>128</h3>
              <p>
                <Clock
                  size={16}
                  style={{ display: "inline", verticalAlign: "text-bottom" }}
                />{" "}
                Giờ nghe nhạc
              </p>
            </div>
            <div className="stat-card">
              <h3>342</h3>
              <p>
                <Music
                  size={16}
                  style={{ display: "inline", verticalAlign: "text-bottom" }}
                />{" "}
                Bài hát đã nghe
              </p>
            </div>
            <div className="stat-card">
              <h3>58</h3>
              <p>
                <Heart
                  size={16}
                  style={{ display: "inline", verticalAlign: "text-bottom" }}
                />{" "}
                Bài hát đã thích
              </p>
            </div>
            <div className="stat-card">
              <h3>12</h3>
              <p>
                <BarChart2
                  size={16}
                  style={{ display: "inline", verticalAlign: "text-bottom" }}
                />{" "}
                Playlist đã tạo
              </p>
            </div>
          </div>

          <div className="chart-container">
            <h2 className="chart-title">Thời gian nghe nhạc tuần này (Giờ)</h2>
            <div className="bar-chart">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="bar-col"
                  title={`${item.hours} giờ`}
                >
                  <div
                    className="bar-fill"
                    style={{ height: item.height }}
                  ></div>
                  <span className="bar-label">{item.day}</span>
                </div>
              ))}
            </div>
            <p
              style={{
                textAlign: "center",
                marginTop: "1.5rem",
                color: "#10b981",
                fontWeight: "bold",
              }}
            >
              Bạn nghe nhiều hơn 69% người dùng tháng này!
            </p>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="tab-content fade-in">
          <div
            style={{
              backgroundColor: "#1f2937",
              padding: "2rem",
              borderRadius: "1rem",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                marginBottom: "1.5rem",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              Thông tin cơ bản
            </h2>
            <div className="form-group">
              <label>Tên hiển thị</label>
              <input type="text" defaultValue="Giau ten" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                defaultValue="a@gmail.com"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              />
            </div>
            <button className="btn-save">Lưu thay đổi</button>
          </div>

          <div
            style={{
              backgroundColor: "#1f2937",
              padding: "2rem",
              borderRadius: "1rem",
            }}
          >
            <h2
              style={{
                marginBottom: "1.5rem",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              Đổi mật khẩu
            </h2>
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="btn-save">Cập nhật mật khẩu</button>
          </div>
        </div>
      )}

      {activeTab === "premium" && (
        <div className="tab-content fade-in">
          <h2
            style={{
              textAlign: "center",
              marginBottom: "3rem",
              fontSize: "2rem",
            }}
          >
            Chọn gói cước phù hợp với bạn
          </h2>
          <div className="premium-grid">
            <div className="plan-card">
              <h3>Free Plan</h3>
              <div className="plan-price">
                0đ{" "}
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#9ca3af",
                    fontWeight: "normal",
                  }}
                >
                  /tháng
                </span>
              </div>
              <ul className="plan-features">
                <li>
                  <CheckCircle size={18} color="#10b981" /> Nghe nhạc tiêu chuẩn
                  (128kbps)
                </li>
                <li>
                  <CheckCircle size={18} color="#10b981" /> Có chứa quảng cáo
                </li>
                <li>
                  <CheckCircle size={18} color="#10b981" /> Bỏ qua tối đa 6
                  bài/giờ
                </li>
              </ul>
              <button className="btn-plan btn-free" disabled>
                Gói hiện tại
              </button>
            </div>

            <div className="plan-card premium">
              <h3 style={{ color: "#f59e0b" }}>Premium Pro</h3>
              <div className="plan-price">
                99999.000đ{" "}
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#9ca3af",
                    fontWeight: "normal",
                  }}
                >
                  /tháng
                </span>
              </div>
              <ul className="plan-features">
                <li>
                  <CheckCircle size={18} color="#f59e0b" /> Âm thanh chất lượng
                  cao (320kbps/Lossless)
                </li>
                <li>
                  <CheckCircle size={18} color="#f59e0b" /> Không bao giờ có
                  quảng cáo
                </li>
                <li>
                  <CheckCircle size={18} color="#f59e0b" /> Chuyển bài không
                  giới hạn
                </li>
                <li>
                  <CheckCircle size={18} color="#f59e0b" /> Nghe nhạc Offline
                </li>
              </ul>
              <button
                className="btn-plan btn-pro"
                onClick={() => {
                  setIsPremium(true);
                  alert(
                    "Chúc mừng bạn đã nâng cấp thành công lên gói Premium!",
                  );
                }}
              >
                {isPremium ? "Đã kích hoạt" : "Nâng cấp ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
