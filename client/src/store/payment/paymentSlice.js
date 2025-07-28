import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from './paymentService';

const initialState = {
    order: null,
    isLoading: false,
    isError: false,
    message: ''
};

export const createOrder = createAsyncThunk('rides/payment/createOrder', async (rideId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await paymentService.createOrder(rideId, token);
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
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.order = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;