import { fetchAPI } from './api';

export const getPaymentMethods = async (accessToken: string) => {
  return fetchAPI('/payment-method', {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
