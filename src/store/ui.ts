import { create } from 'zustand';

export interface ToastMsg {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

interface UIState {
  toasts: ToastMsg[];
  toast: (message: string, action?: ToastMsg['action']) => void;
  dismiss: (id: number) => void;
  /** Chore editor: null = closed, 'new' = create (optional preset space), id = edit. */
  editor: { mode: 'new'; spaceId?: string } | { mode: 'edit'; id: string } | null;
  openEditor: (e: UIState['editor']) => void;
}

let next = 1;

export const useUI = create<UIState>()((set, get) => ({
  toasts: [],
  toast: (message, action) => {
    const id = next++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, action }] }));
    setTimeout(() => get().dismiss(id), 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  editor: null,
  openEditor: (editor) => set({ editor }),
}));
