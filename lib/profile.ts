import { fetchAPI } from './api';

export async function getProfile(token: string) {
  return fetchAPI('/users/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getNotificationSettings(token: string) {
  return fetchAPI('/users/profile/notifications', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateNotificationSettings(
  token: string,
  payload: {
    alertBudget: boolean;
    transactionReminder: boolean;
    emailNotification: boolean;
  },
) {
  return fetchAPI('/users/profile/notifications', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(
  token: string,
  payload: {
    name: string;
    email: string;
    phone: string;
  },
) {
  return fetchAPI('/users/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function changePassword(
  token: string,
  payload: {
    oldPassword: string;
    newPassword: string;
  },
) {
  return fetchAPI('/users/profile/password', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
