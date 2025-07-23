import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'rides/';

const createRide = async (rideData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, rideData, config);
    return response.data;
};

const getRides = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const bookRide = async (rideId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + rideId + '/book', {}, config);
    return response.data;
};

const getMyOfferedRides = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'my-offered-rides', config);
    return response.data;
};

const getMyBookedRides = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'my-booked-rides', config);
    return response.data;
};

const startRide = async (rideId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + rideId + '/start', {}, config);
    return response.data;
};

const manageBookingRequest = async (rideId, passengerId, status, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + `${rideId}/requests/${passengerId}`, { status }, config);
    return response.data;
};

const getChatHistory = async (rideId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + rideId + '/chat', config);
    return response.data;
};

const endRide = async (rideId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + rideId + '/end', {}, config);
    return response.data;
};

const rideService = {
    createRide, getRides, bookRide, getMyOfferedRides, getMyBookedRides,
    startRide, manageBookingRequest, getChatHistory, endRide
};
export default rideService;