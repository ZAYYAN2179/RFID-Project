import { create } from "zustand";

interface TagData {
  epc: string;
  nama: string;
  waktu: string;
}

interface TagStore {
  tags: TagData[];
  addTag: (tag: TagData) => void;
  clearTags: () => void;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  addTag: (tag) =>
    set((state) => ({
      tags: [tag, ...state.tags], 
    })),
  clearTags: () => set({ tags: [] }),
}));
