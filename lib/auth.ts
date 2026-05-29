// lib/auth.ts

import { fetchAPI } from './api';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

// REGISTER
export const registerUser = async (payload: RegisterPayload) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// LOGIN
export const loginUser = async (payload: LoginPayload) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
