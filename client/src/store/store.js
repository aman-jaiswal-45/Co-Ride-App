import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import rideReducer from './ride/rideSlice';
import userReducer from './user/userSlice';
import adminReducer from './admin/adminSlice'; 
import reviewReducer from './review/reviewSlice';
import feedbackReducer from './feedback/feedbackSlice';
import paymentReducer from './payment/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rides: rideReducer,
    user: userReducer,
    admin: adminReducer, 
    reviews: reviewReducer,
    feedback: feedbackReducer,
    payment: paymentReducer,
  },
}); 