import React, { useState, useEffect, useRef } from "react";
import { userAPI, authAPI } from "../services/api";
import { Camera, Save, KeyRound } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        if (res.success) setProfile(res.data);
      } catch (error) {
        showMessage(error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        display_name: profile.display_name,
        bio: profile.bio,
        country: profile.country,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
      };
      const res = await userAPI.updateProfile(updateData);
      if (res.success) {
        setProfile(res.data);
        showMessage("Cập nhật hồ sơ thành công!");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password.length < 8) {
      return showMessage("Mật khẩu mới phải tối thiểu 8 ký tự", "error");
    }
    try {
      const res = await authAPI.changePassword(passwords);
      if (res.success) {
        showMessage("Đổi mật khẩu thành công!");
        setPasswords({ old_password: "", new_password: "" });
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024)
      return showMessage("File ảnh tối đa 5MB", "error");

    try {
      const res = await userAPI.uploadAvatar(file);
      if (res.success) {
        setProfile({ ...profile, avatar_url: res.data.avatar_url });
        showMessage("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  if (isLoading) return <div className="loading">Đang tải hồ sơ...</div>;
  if (!profile)
    return <div className="loading">Không thể tải thông tin hồ sơ.</div>;

  return (
    <div className="profile-container">
      <h1 className="title">Hồ sơ của bạn</h1>

      {message.text && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}

      <div className="profile-layout">
        <div className="sidebar">
          <div
            className="avatar-box"
            onClick={() => fileInputRef.current.click()}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                <Camera size={50} />
              </div>
            )}
            <div className="avatar-overlay">Đổi ảnh</div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            hidden
          />

          <div className="card">
            <p className="label">Email đăng nhập</p>
            <p className="email">{profile.email}</p>

            <div
              className={`plan ${profile.plan === "premium" ? "premium" : ""}`}
            >
              Gói: {profile.plan}
            </div>
          </div>
        </div>

        <div className="main">
          {/* PROFILE FORM */}
          <form className="card" onSubmit={handleUpdateProfile}>
            <h2>Chỉnh sửa hồ sơ</h2>

            <div className="grid">
              <input
                type="text"
                value={profile.display_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
                placeholder="Tên hiển thị"
              />

              <input
                type="text"
                value={profile.country || ""}
                onChange={(e) =>
                  setProfile({ ...profile, country: e.target.value })
                }
                placeholder="Quốc gia"
              />

              <textarea
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Bio"
              />

              <input
                type="date"
                value={
                  profile.date_of_birth
                    ? profile.date_of_birth.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setProfile({ ...profile, date_of_birth: e.target.value })
                }
              />

              <select
                value={profile.gender || ""}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
              >
                <option value="">Chưa xác định</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <button className="btn primary">
              <Save size={18} /> Lưu
            </button>
          </form>

          {/* PASSWORD */}
          <form className="card" onSubmit={handleChangePassword}>
            <h2>Đổi mật khẩu</h2>

            <div className="grid">
              <input
                type="password"
                value={passwords.old_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    old_password: e.target.value,
                  })
                }
                placeholder="Mật khẩu hiện tại"
              />

              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    new_password: e.target.value,
                  })
                }
                placeholder="Mật khẩu mới"
              />
            </div>

            <button className="btn outline">
              <KeyRound size={18} /> Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
