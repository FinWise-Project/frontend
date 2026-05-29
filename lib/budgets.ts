import { fetchAPI } from './api';

export const getBudgets = async (accessToken: string) => {
  return fetchAPI('/budgets', {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createBudget = async (
  accessToken: string,
  payload: {
    categoryId: string;
    limitAmount: number;
    alertThreshold: number;
    month: string;
  },
) => {
  return fetchAPI('/budgets', {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify(payload),
  });
};

export const updateBudget = async (
  accessToken: string,
  id: string,
  payload: {
    limitAmount: number;
    alertThreshold: number;
  },
) => {
  return fetchAPI(`/budgets/${id}`, {
    method: 'PUT',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify(payload),
  });
};

export const deleteBudget = async (accessToken: string, id: string) => {
  return fetchAPI(`/budgets/${id}`, {
    method: 'DELETE',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
