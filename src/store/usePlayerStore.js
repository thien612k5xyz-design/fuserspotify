import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 1,
  isShuffle: false,
  isRepeat: false,
  queue: [],
  currentIndex: -1,

  playSong: (song, newQueue = []) => {
    const queueToUse = newQueue.length > 0 ? newQueue : [song];
    const index = queueToUse.findIndex((s) => s.id === song.id);

    set({
      currentSong: song,
      isPlaying: true,
      queue: queueToUse,
      currentIndex: index !== -1 ? index : 0,
    });
  },

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

  playNext: () => {
    const { queue, currentIndex, isShuffle, isRepeat } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      nextIndex = isRepeat ? 0 : currentIndex;
      if (!isRepeat && nextIndex === currentIndex) {
        return set({ isPlaying: false });
      }
    }

    set({
      currentSong: queue[nextIndex],
      currentIndex: nextIndex,
      isPlaying: true,
    });
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = 0;

    set({
      currentSong: queue[prevIndex],
      currentIndex: prevIndex,
      isPlaying: true,
    });
  },

  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  removeFromQueue: (songId) =>
    set((state) => ({ queue: state.queue.filter((s) => s.id !== songId) })),
}));
