// src/hooks/useDebounce.jsx
import { useState, useEffect } from "react";

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Đặt bộ đếm thời gian: Sau `delay` mili-giây thì mới cập nhật giá trị
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Dọn dẹp: Nếu người dùng gõ phím mới TRƯỚC KHI hết giờ, hủy bộ đếm cũ đi
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
