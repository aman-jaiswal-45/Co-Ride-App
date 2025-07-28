import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import feedbackService from './feedbackService';

const initialState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
};

export const submitFeedback = createAsyncThunk('feedback/submit', async (feedbackData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await feedbackService.submitFeedback(feedbackData, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitFeedback.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(submitFeedback.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(submitFeedback.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = feedbackSlice.actions;
export default feedbackSlice.reducer;