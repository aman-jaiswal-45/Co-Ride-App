import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'feedback/';

// Submit feedback
const submitFeedback = async (feedbackData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, feedbackData, config);
    return response.data;
};

const feedbackService = {
    submitFeedback,
};

export default feedbackService;