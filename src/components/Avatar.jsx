import React from "react";
import { BASE_URL } from "../services/api";

const Avatar = ({ url, alt = "avatar", size = 40 }) => {
  if (!url) {
    return (
      <img
        src="/default-avatar.png"
        alt={alt}
        width={size}
        height={size}
        style={{ borderRadius: "50%" }}
      />
    );
  }
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  return (
    <img
      src={fullUrl}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: "50%" }}
    />
  );
};

export default Avatar;
