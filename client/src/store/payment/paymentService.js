import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'rides/payments/';

// Create Razorpay order
const createOrder = async (rideId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + `create-order/${rideId}`, {}, config);
    return response.data;
};

const paymentService = {
    createOrder,
};

export default paymentService;