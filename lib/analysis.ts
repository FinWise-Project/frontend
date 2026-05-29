import { fetchAPI } from './api';

export const getAnalysis = async (token: string) => {
  return fetchAPI('/analysis', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
