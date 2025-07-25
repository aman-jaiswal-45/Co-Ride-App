import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';
import { updateUserProfile } from '../user/userSlice'; // Import the action from userSlice

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
    try {
        const tokenData = await authService.register(user);
        const userData = await authService.getMe(tokenData.token);
        const combinedData = { token: tokenData.token, data: userData.data };
        localStorage.setItem('user', JSON.stringify(combinedData));
        return combinedData;
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
    try {
        const tokenData = await authService.login(user);
        const userData = await authService.getMe(tokenData.token);
        const combinedData = { token: tokenData.token, data: userData.data };
        localStorage.setItem('user', JSON.stringify(combinedData));
        return combinedData;
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout();
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => { state.isLoading = true; })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(login.pending, (state) => { state.isLoading = true; })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(logout.fulfilled, (state) => { state.user = null; })
            // THIS IS THE FIX: Listen for the updateUserProfile action
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.data = action.payload.data;
                    // Also update localStorage to persist the change on refresh
                    const updatedUser = JSON.stringify(state.user);
                    localStorage.setItem('user', updatedUser);
                }
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;