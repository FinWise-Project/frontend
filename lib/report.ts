import { fetchAPI } from './api';

export const getReport = async (token: string) => {
  return fetchAPI('/report', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
