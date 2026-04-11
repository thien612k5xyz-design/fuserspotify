import React, { useState, useEffect } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import {
  Play,
  Heart,
  MoreHorizontal,
  Clock,
  Plus,
  ListMusic,
} from "lucide-react";
import "./Library.css";

const Library = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [filterGenre, setFilterGenre] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [menu, setMenu] = useState({ isOpen: false, x: 0, y: 0, song: null });

  const mockSongs = [
    {
      id: "1",
      title: "Shape of You",
      artist: "Ed Sheeran",
      album: "1",
      genre: "Pop",
      duration: "3:53",
      plays: 1500000,
      createdAt: "2023-10-01",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "2",
      title: "Light",
      artist: "wkd",
      album: "2",
      genre: "K-Pop",
      duration: "3:20",
      plays: 2500000,
      createdAt: "2023-11-15",
      coverUrl:
        "https://cdn.donmai.us/sample/64/30/__togawa_sakiko_arknights_and_2_more_drawn_by_yukuso_dabiandang__sample-643018782c88c017e3ad1bbbbfab4d98.jpg",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
  ];

  const openMenu = (e, song) => {
    e.preventDefault();
    e.stopPropagation();
    let clickX = e.pageX;
    let clickY = e.pageY;
    if (clickX + 224 > window.innerWidth) clickX = window.innerWidth - 240;
    if (clickY + 160 > window.innerHeight) clickY = window.innerHeight - 176;
    setMenu({ isOpen: true, x: clickX, y: clickY, song });
  };

  useEffect(() => {
    const closeMenu = () => setMenu((prev) => ({ ...prev, isOpen: false }));
    if (menu.isOpen) window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [menu.isOpen]);

  const genres = ["All", ...new Set(mockSongs.map((s) => s.genre))];
  let displayedSongs =
    filterGenre === "All"
      ? [...mockSongs]
      : mockSongs.filter((s) => s.genre === filterGenre);
  displayedSongs.sort((a, b) =>
    sortOption === "az"
      ? a.title.localeCompare(b.title)
      : sortOption === "popular"
        ? b.plays - a.plays
        : new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="library-container">
      <h1 className="library-title">Thư viện bài hát</h1>

      <div className="tools-bar">
        <div className="filter-group">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGenre(g)}
              className={`btn-filter ${filterGenre === g ? "active" : ""}`}
            >
              {g === "All" ? "Tất cả" : g}
            </button>
          ))}
        </div>
        <div>
          <span
            style={{ color: "#9ca3af", fontSize: "14px", marginRight: "8px" }}
          >
            Sắp xếp:
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Nghe nhiều nhất</option>
            <option value="az">Theo tên (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="song-table-header">
        <div style={{ textAlign: "center" }}>#</div>
        <div>Tiêu đề</div>
        <div>Album</div>
        <div>Thể loại</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "2rem",
          }}
        >
          <Clock size={16} />
        </div>
      </div>

      <div>
        {displayedSongs.map((song, index) => {
          const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
          return (
            <div
              key={song.id}
              className="song-table-row"
              onDoubleClick={() => playSong(song)}
              onContextMenu={(e) => openMenu(e, song)}
            >
              <div className="cell-index">
                <span
                  className="hover-hide"
                  style={
                    isThisSongPlaying
                      ? { color: "#10b981", fontWeight: "bold" }
                      : {}
                  }
                >
                  {index + 1}
                </span>
                <button
                  onClick={() => playSong(song)}
                  className="hover-show"
                  style={{ display: "none" }}
                >
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
              <div className="cell-info">
                <img src={song.coverUrl} alt="cover" />
                <div>
                  <div
                    className={`cell-title ${isThisSongPlaying ? "playing" : ""}`}
                  >
                    {song.title}
                  </div>
                  <div className="cell-artist">{song.artist}</div>
                </div>
              </div>
              <div className="cell-album">{song.album}</div>
              <div className="cell-genre">
                <span className="genre-badge">{song.genre}</span>
              </div>
              <div className="cell-actions">
                <button className="hover-show">
                  <Heart size={18} />
                </button>
                <span style={{ width: "40px", textAlign: "right" }}>
                  {song.duration}
                </span>
                <button
                  onClick={(e) => openMenu(e, song)}
                  className="hover-show"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {menu.isOpen && (
        <div
          className="context-menu"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="menu-header">
            <img src={menu.song?.coverUrl} alt="cover" />
            <div>
              <h4>{menu.song?.title}</h4>
              <p>{menu.song?.artist}</p>
            </div>
          </div>
          <div style={{ padding: "4px" }}>
            <button className="menu-btn">
              <Plus size={16} /> Thêm vào Playlist
            </button>
            <button className="menu-btn">
              <ListMusic size={16} /> Thêm vào Hàng đợi
            </button>
            <button className="menu-btn">
              <Heart size={16} /> Lưu vào Bài hát đã thích
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Library;
