import { fetchAPI } from './api';

export const getCategories = async (accessToken: string) => {
  return fetchAPI('/categories', {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
