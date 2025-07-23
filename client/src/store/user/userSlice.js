import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from './userService';

const initialState = {
    profile: null,
    isLoading: false,
    isError: false,
    message: ''
};

export const getUserProfile = createAsyncThunk('user/getProfile', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await userService.getUserProfile(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const updateUserProfile = createAsyncThunk('user/updateProfile', async (userData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await userService.updateUserProfile(userData, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserProfile.pending, (state) => { state.isLoading = true; })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload.data;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateUserProfile.pending, (state) => { state.isLoading = true; })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload.data;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;