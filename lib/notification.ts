// lib/notification.ts

import { fetchAPI } from './api';

export const getNotifications = async (token: string) => {
  return fetchAPI('/notifications', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const markAllNotificationsAsRead = async (token: string) => {
  return fetchAPI('/notifications/read-all', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
