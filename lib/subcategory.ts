import { fetchAPI } from './api';

export const getSubcategories = async (
  accessToken: string,
  categoryId: string,
) => {
  return fetchAPI(`/sub-categories?categoryId=${categoryId}`, {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
