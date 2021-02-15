import createStore from 'zustand';

type VisibleStore = Record<number, boolean> & {
  markVisible: (id: number) => void;
};

export const useVisible = createStore<VisibleStore>((set) => ({
  markVisible: (id: number) => set({ [id]: true }),
}));
