import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'auth/';

// Register user - just returns token data
const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);
    return response.data;
};

// Login user - just returns token data
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);
    return response.data;
};

// Get user data from protected route
const getMe = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL + 'me', config);
    return response.data; // This returns { success: true, data: userObject }
};


// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    register,
    login,
    logout,
    getMe,
};

export default authService;