"use client";
import { create } from "zustand";
import type { INotification } from "@/types";

interface NotificationStore {
  notifications: INotification[];
  unreadCount: number;
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}));
