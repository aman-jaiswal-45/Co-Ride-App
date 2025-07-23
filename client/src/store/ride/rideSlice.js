import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rideService from './rideService';

const initialState = {
    rides: [],
    offeredRides: [],
    bookedRides: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
    chatHistory: [],
};

export const createRide = createAsyncThunk('rides/create', async (rideData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.createRide(rideData, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getRides = createAsyncThunk('rides/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.getRides(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const bookRide = createAsyncThunk('rides/book', async (rideId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.bookRide(rideId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const manageBookingRequest = createAsyncThunk('rides/manageRequest', async (data, thunkAPI) => {
    const { rideId, passengerId, status } = data;
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.manageBookingRequest(rideId, passengerId, status, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getMyOfferedRides = createAsyncThunk('rides/getMyOffered', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.getMyOfferedRides(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getMyBookedRides = createAsyncThunk('rides/getMyBooked', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.getMyBookedRides(token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const startRide = createAsyncThunk('rides/start', async (rideId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.startRide(rideId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getChatHistory = createAsyncThunk('rides/getChat', async (rideId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.getChatHistory(rideId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const endRide = createAsyncThunk('rides/end', async (rideId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await rideService.endRide(rideId, token);
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const rideSlice = createSlice({
    name: 'ride',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            state.chatHistory = [];
        },
        addChatMessage: (state, action) => { // <-- ADD THIS REDUCER
            state.chatHistory.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createRide.pending, (state) => { state.isLoading = true; })
            .addCase(createRide.fulfilled, (state) => { state.isLoading = false; state.isSuccess = true; })
            .addCase(createRide.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            .addCase(getRides.pending, (state) => { state.isLoading = true; })
            .addCase(getRides.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.rides = action.payload.data; })
            .addCase(getRides.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            .addCase(bookRide.pending, (state) => { state.isLoading = true; })
            .addCase(bookRide.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Update the ride in the main rides list to show the new pending request
                const index = state.rides.findIndex(ride => ride._id === action.payload.data._id);
                if (index !== -1) {
                    state.rides[index] = action.payload.data;
                }
            })
            .addCase(bookRide.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            .addCase(getMyOfferedRides.pending, (state) => { state.isLoading = true; })
            .addCase(getMyOfferedRides.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.offeredRides = action.payload.data; })
            .addCase(getMyOfferedRides.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            .addCase(getMyBookedRides.pending, (state) => { state.isLoading = true; })
            .addCase(getMyBookedRides.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.bookedRides = action.payload.data; })
            .addCase(getMyBookedRides.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            .addCase(manageBookingRequest.pending, (state) => { state.isLoading = true; })
            .addCase(manageBookingRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Update the specific offered ride with the new passenger statuses
                const index = state.offeredRides.findIndex(ride => ride._id === action.payload.data._id);
                if (index !== -1) {
                    state.offeredRides[index] = action.payload.data;
                }
            })
            .addCase(manageBookingRequest.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload})
            .addCase(startRide.pending, (state) => { state.isLoading = true; })
            .addCase(startRide.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.offeredRides.findIndex(ride => ride._id === action.payload.data._id);
                if (index !== -1) {
                    state.offeredRides[index].status = 'InProgress';
                }
            })
            .addCase(startRide.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getChatHistory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getChatHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.chatHistory = action.payload.data;
            })
            .addCase(getChatHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(endRide.pending, (state) => { state.isLoading = true; })
            .addCase(endRide.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.offeredRides.findIndex(ride => ride._id === action.payload.data._id);
                if (index !== -1) {
                    state.offeredRides[index].status = 'Completed';
                }
            })
            .addCase(endRide.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset , addChatMessage } = rideSlice.actions;
export default rideSlice.reducer;