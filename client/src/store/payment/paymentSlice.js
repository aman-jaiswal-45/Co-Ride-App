import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from './paymentService';

const initialState = {
    order: null,
    isLoading: false,
    isError: false,
    message: ''
};

export const createPayPalOrder = createAsyncThunk('payment/createOrder', async (rideId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await paymentService.createPayPalOrder(rideId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const capturePayPalOrder = createAsyncThunk('payment/captureOrder', async (orderId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await paymentService.capturePayPalOrder(orderId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPayPalOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPayPalOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.order = action.payload;
            })
            .addCase(createPayPalOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(capturePayPalOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(capturePayPalOrder.fulfilled, (state) => {
                state.isLoading = false;
                state.order = null; // Clear order on capture
            })
            .addCase(capturePayPalOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;