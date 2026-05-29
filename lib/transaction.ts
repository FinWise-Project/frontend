import { fetchAPI } from './api';

interface GetTransactionsParams {
  categoryName?: string;
  type?: 'income' | 'expense';
}

interface TransactionPayload {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  subCategoryId: string;
  paymentMethodId: string;
  description: string;
}

export const getTransactions = async (
  accessToken: string,
  params?: GetTransactionsParams,
) => {
  const query = new URLSearchParams();

  if (params?.categoryName) {
    query.append('categoryName', params.categoryName);
  }

  if (params?.type) {
    query.append('type', params.type);
  }

  const queryString = query.toString();

  return fetchAPI(`/transactions${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getTransactionById = async (
  accessToken: string,
  transactionId: string,
) => {
  return fetchAPI(`/transactions/${transactionId}`, {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createTransaction = async (
  accessToken: string,
  payload: TransactionPayload,
) => {
  return fetchAPI('/transactions', {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(payload),
  });
};

export const updateTransaction = async (
  accessToken: string,
  transactionId: string,
  payload: TransactionPayload,
) => {
  return fetchAPI(`/transactions/${transactionId}`, {
    method: 'PUT',

    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(payload),
  });
};

export const deleteTransaction = async (
  accessToken: string,
  transactionId: string,
) => {
  return fetchAPI(`/transactions/${transactionId}`, {
    method: 'DELETE',

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
