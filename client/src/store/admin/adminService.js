import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'admin/';

const getStats = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'stats', config);
    return response.data;
};

const getAllUsers = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'users', config);
    return response.data;
};

const getAllRides = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'rides', config);
    return response.data;
};

const getAllFeedback = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'feedback', config);
    return response.data;
};

const adminService = {
    getStats,
    getAllUsers,
    getAllRides,
    getAllFeedback,
};

export default adminService;