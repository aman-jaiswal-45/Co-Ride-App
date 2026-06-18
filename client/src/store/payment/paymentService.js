import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + 'payments/';

// Create PayPal Order
const createPayPalOrder = async (rideId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + `create-paypal-order/${rideId}`, {}, config);
    return response.data;
};

// Capture PayPal Order
const capturePayPalOrder = async (orderId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + `capture-paypal-order/${orderId}`, {}, config);
    return response.data;
};

const paymentService = {
    createPayPalOrder,
    capturePayPalOrder,
};

export default paymentService;