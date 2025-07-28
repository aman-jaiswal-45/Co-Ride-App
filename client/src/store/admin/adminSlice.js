import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const initialState = {
    stats: null,
    users: [],
    rides: [],
    isLoading: false,
    isError: false,
    message: '',
    feedback: [],
};

export const getStats = createAsyncThunk('admin/getStats', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await adminService.getStats(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getAllUsers = createAsyncThunk('admin/getAllUsers', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await adminService.getAllUsers(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getAllRides = createAsyncThunk('admin/getAllRides', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await adminService.getAllRides(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getAllFeedback = createAsyncThunk('admin/getAllFeedback', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await adminService.getAllFeedback(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStats.pending, (state) => { state.isLoading = true; })
            .addCase(getStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload.data;
            })
            .addCase(getStats.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllUsers.pending, (state) => { state.isLoading = true; })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.data;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllRides.pending, (state) => { state.isLoading = true; })
            .addCase(getAllRides.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rides = action.payload.data;
            })
            .addCase(getAllRides.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllFeedback.pending, (state) => { state.isLoading = true; })
            .addCase(getAllFeedback.fulfilled, (state, action) => {
                state.isLoading = false;
                state.feedback = action.payload.data;
            })
            .addCase(getAllFeedback.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;