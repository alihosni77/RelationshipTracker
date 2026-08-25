import { create } from 'zustand';

interface CoupleState {
  coupleId: string | null;
  partnerId: string | null;
  setCouple: (coupleId: string, partnerId: string) => void;
  clearCouple: () => void;
}

export const useCoupleStore = create<CoupleState>((set) => ({
  coupleId: null,
  partnerId: null,
  setCouple: (coupleId, partnerId) => set({ coupleId, partnerId }),
  clearCouple: () => set({ coupleId: null, partnerId: null })
}));
