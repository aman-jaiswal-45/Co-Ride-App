import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import rideReducer from './ride/rideSlice';
import userReducer from './user/userSlice';
import adminReducer from './admin/adminSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rides: rideReducer,
    user: userReducer,
    admin: adminReducer, 
  },
});