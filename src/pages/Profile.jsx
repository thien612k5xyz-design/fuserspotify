import React, { useState, useEffect, useRef } from "react";
import { userAPI, authAPI } from "../services/api";
import { Camera, Save, KeyRound } from "lucide-react";

const Profile = () => {
  // Trạng thái dữ liệu
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Trạng thái Form Đổi mật khẩu
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  // Trạng thái thông báo
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  // 1. LẤY THÔNG TIN HỒ SƠ
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

  // 2. CẬP NHẬT CHỮ (TÊN, BIO, NGÀY SINH...)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Chỉ gửi lên những trường cho phép sửa
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

  // 3. ĐỔI MẬT KHẨU
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password.length < 8) {
      return showMessage("Mật khẩu mới phải tối thiểu 8 ký tự", "error");
    }
    try {
      const res = await authAPI.changePassword(passwords);
      if (res.success) {
        showMessage("Đổi mật khẩu thành công!");
        setPasswords({ old_password: "", new_password: "" }); // Xóa trắng form
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  // 4. UPLOAD ẢNH ĐẠI DIỆN
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate nhanh ở Frontend
    if (file.size > 5 * 1024 * 1024)
      return showMessage("File ảnh tối đa 5MB", "error");

    try {
      const res = await userAPI.uploadAvatar(file);
      if (res.success) {
        // Cập nhật lại ảnh trên màn hình ngay lập tức
        setProfile({ ...profile, avatar_url: res.data.avatar_url });
        showMessage("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  if (isLoading)
    return (
      <div style={{ padding: "50px", color: "white" }}>
        Đang tải hồ sơ... ⏳
      </div>
    );
  if (!profile)
    return (
      <div style={{ padding: "50px", color: "white" }}>
        Không thể tải thông tin hồ sơ.
      </div>
    );

  return (
    <div
      style={{
        padding: "40px",
        color: "white",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "30px" }}>Hồ sơ của bạn</h1>

      {/* HIỂN THỊ THÔNG BÁO TOAST */}
      {message.text && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            fontWeight: "bold",
            backgroundColor: message.type === "error" ? "#e91429" : "#1ed760",
            color: message.type === "error" ? "white" : "black",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", gap: "50px", alignItems: "flex-start" }}>
        {/* KHU VỰC 1: AVATAR & THÔNG TIN CHUNG */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            width: "250px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundColor: "#282828",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            }}
            onClick={() => fileInputRef.current.click()}
            title="Bấm để đổi ảnh đại diện"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Camera size={50} color="#b3b3b3" />
              </div>
            )}
            {/* Lớp overlay khi hover */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                background: "rgba(0,0,0,0.6)",
                padding: "10px 0",
                textAlign: "center",
                color: "white",
                fontSize: "14px",
              }}
            >
              Đổi ảnh
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
          />

          <div
            style={{
              width: "100%",
              background: "#181818",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 5px 0",
                color: "#b3b3b3",
                fontSize: "14px",
              }}
            >
              Email đăng nhập
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>{profile.email}</p>
            <div
              style={{
                marginTop: "15px",
                display: "inline-block",
                padding: "5px 15px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                backgroundColor:
                  profile.plan === "premium" ? "#1ed760" : "#535353",
                color: profile.plan === "premium" ? "black" : "white",
              }}
            >
              Gói: {profile.plan}
            </div>
          </div>
        </div>

        {/* KHU VỰC 2: CÁC FORM CẬP NHẬT */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "40px",
          }}
        >
          {/* FORM THÔNG TIN CÁ NHÂN */}
          <form
            onSubmit={handleUpdateProfile}
            style={{
              background: "#181818",
              padding: "30px",
              borderRadius: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "20px",
                borderBottom: "1px solid #333",
                paddingBottom: "10px",
              }}
            >
              Chỉnh sửa hồ sơ
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={profile.display_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Quốc gia
                </label>
                <input
                  type="text"
                  value={profile.country || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, country: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Tiểu sử (Bio)
                </label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                    resize: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Ngày sinh
                </label>
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
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Giới tính
                </label>
                <select
                  value={profile.gender || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                  }}
                >
                  <option value="">Chưa xác định</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                borderRadius: "50px",
                background: "white",
                color: "black",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Save size={18} /> Lưu thay đổi
            </button>
          </form>

          {/* FORM ĐỔI MẬT KHẨU */}
          <form
            onSubmit={handleChangePassword}
            style={{
              background: "#181818",
              padding: "30px",
              borderRadius: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "20px",
                borderBottom: "1px solid #333",
                paddingBottom: "10px",
              }}
            >
              Đổi mật khẩu
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={passwords.old_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, old_password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#b3b3b3",
                  }}
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwords.new_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new_password: e.target.value })
                  }
                  placeholder="Tối thiểu 8 ký tự"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: "#282828",
                    color: "white",
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                borderRadius: "50px",
                background: "transparent",
                border: "1px solid #b3b3b3",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <KeyRound size={18} /> Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
