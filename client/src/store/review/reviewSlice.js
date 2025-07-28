import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewService from './reviewService';

const initialState = {
    reviews: [],
    isLoading: false,
    isError: false,
    message: ''
};

export const addReview = createAsyncThunk('reviews/add', async (reviewData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await reviewService.addReview(reviewData, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getUserReviews = createAsyncThunk('reviews/getUser', async (userId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await reviewService.getUserReviews(userId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(addReview.pending, (state) => { state.isLoading = true; })
            .addCase(addReview.fulfilled, (state) => { state.isLoading = false; })
            .addCase(addReview.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getUserReviews.pending, (state) => { state.isLoading = true; })
            .addCase(getUserReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.data;
            })
            .addCase(getUserReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = reviewSlice.actions;
export default reviewSlice.reducer;