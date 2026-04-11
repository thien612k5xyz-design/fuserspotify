import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Search as SearchIcon, Play, User, Disc, Music } from "lucide-react";
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const playSong = usePlayerStore((state) => state.playSong);

  const mockSongs = [
    {
      id: "s1",
      title: "Shape of You",
      artist: "Ed Sheeran",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  ];
  const mockArtists = [
    {
      id: "a1",
      name: "Ed Sheeran",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b27312ab2bd0ed03b9b41a3bc3a3",
    },
  ];
  const mockAlbums = [
    {
      id: "al1",
      title: "Divide",
      artist: "Ed Sheeran",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
      year: 2017,
    },
  ];

  const searchTerm = query.toLowerCase().trim();
  const filteredSongs = mockSongs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm),
  );
  const filteredArtists = mockArtists.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm),
  );
  const filteredAlbums = mockAlbums.filter((album) =>
    album.title.toLowerCase().includes(searchTerm),
  );
  const hasResults =
    filteredSongs.length > 0 ||
    filteredArtists.length > 0 ||
    filteredAlbums.length > 0;

  return (
    <div className="search-container">
      <div className="search-box">
        <SearchIcon className="search-icon-absolute" size={24} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bạn muốn nghe gì?"
          className="search-input"
        />
      </div>

      {query === "" ? (
        <div className="empty-state">
          <SearchIcon size={64} className="mx-auto mb-4 opacity-20" />
          <h2>Tìm kiếm nhạc yêu thích</h2>
          <p>Gõ tên bài hát, nghệ sĩ hoặc album vào ô bên trên nhé.</p>
        </div>
      ) : !hasResults ? (
        <div className="empty-state">
          <h2>Không tìm thấy kết quả</h2>
          <p>Không tìm thấy kết quả nào cho "{query}".</p>
        </div>
      ) : (
        <div>
          {filteredSongs.length > 0 && (
            <div className="results-section">
              <h2>
                <Music color="#10b981" /> Bài hát
              </h2>
              <div className="song-result-list">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className="song-result-item"
                    onClick={() => playSong(song)}
                  >
                    <img src={song.coverUrl} alt="cover" />
                    <div>
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredArtists.length > 0 && (
            <div className="results-section">
              <h2>
                <User color="#60a5fa" /> Nghệ sĩ
              </h2>
              <div className="flex-grid">
                {filteredArtists.map((artist) => (
                  <div key={artist.id} className="artist-card">
                    <img src={artist.imageUrl} alt="artist" />
                    <h4>{artist.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAlbums.length > 0 && (
            <div className="results-section">
              <h2>
                <Disc color="#c084fc" /> Album
              </h2>
              <div className="flex-grid">
                {filteredAlbums.map((album) => (
                  <div key={album.id} className="album-card">
                    <img src={album.coverUrl} alt="album" />
                    <h4>{album.title}</h4>
                    <p>
                      {album.year} • {album.artist}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Search;
