import { fetchAPI } from './api';

export const getPrediction = async (token: string) => {
  return fetchAPI('/predict', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
