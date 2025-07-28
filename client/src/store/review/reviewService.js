import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'reviews/';

// Add a review
const addReview = async (reviewData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, reviewData, config);
    return response.data;
};

// Get reviews for a user
const getUserReviews = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + `user/${userId}`, config);
    return response.data;
};

const reviewService = {
    addReview,
    getUserReviews,
};

export default reviewService;