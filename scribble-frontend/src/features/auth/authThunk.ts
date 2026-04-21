import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { LoginCredentials, AuthResponse, AuthData } from './types';

export const signupUser = createAsyncThunk<AuthData, LoginCredentials>(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', userData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk<AuthData, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
