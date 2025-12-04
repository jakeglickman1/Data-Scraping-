import { create } from "zustand";
import { Trip, VisitedPlace, WishlistItem } from "../types/api";

interface DataState {
  trips: Trip[];
  visitedPlaces: VisitedPlace[];
  wishlist: WishlistItem[];
  setTrips: (trips: Trip[]) => void;
  setVisitedPlaces: (places: VisitedPlace[]) => void;
  setWishlist: (items: WishlistItem[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
  trips: [],
  visitedPlaces: [],
  wishlist: [],
  setTrips: (trips) => set({ trips }),
  setVisitedPlaces: (visitedPlaces) => set({ visitedPlaces }),
  setWishlist: (wishlist) => set({ wishlist }),
}));
