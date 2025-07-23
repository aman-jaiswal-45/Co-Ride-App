import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'users/';

const getUserProfile = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'profile', config);
    return response.data;
};

const updateUserProfile = async (userData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + 'profile', userData, config);
    return response.data;
};

const userService = {
    getUserProfile,
    updateUserProfile,
};

export default userService;