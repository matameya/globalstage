import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppNotification } from '@/types';

const seedNotifications: AppNotification[] = [
  {
    id: 'n-welcome',
    title: 'Welcome to Global Stage',
    body: 'Discover tournaments near you and add your first player to get started.',
    kind: 'general',
    createdAt: new Date().toISOString(),
    read: false,
  },
];

interface NotificationState {
  notifications: AppNotification[];
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      pushToken: null,

      setPushToken: (token) => set({ pushToken: token }),

      addNotification: (n) => {
        const notification: AppNotification = {
          ...n,
          id: `n-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set({ notifications: [notification, ...get().notifications] });
      },

      markRead: (id) => {
        set({
          notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        });
      },

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'globalstage-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
