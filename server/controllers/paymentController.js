const axios = require('axios');
const Ride = require('../models/Ride');

// Helper to get PayPal Access Token
const getPayPalAccessToken = async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('PayPal Client ID or Client Secret is missing in env');
    }
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = process.env.PAYPAL_MODE === 'live' 
        ? 'https://api-m.paypal.com/v1/oauth2/token'
        : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

    const response = await axios.post(url, 'grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data.access_token;
};

// Create a PayPal Order
exports.createPayPalOrder = async (req, res) => {
    try {
        const { rideId } = req.params;
        const userId = req.user.id;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        if (ride.status !== 'InProgress') {
            return res.status(400).json({ success: false, error: 'Payment can only be made after the ride has started.' });
        }

        const passenger = ride.passengers.find(p => p.user.toString() === userId && p.status === 'approved');
        if (!passenger) {
            return res.status(403).json({ success: false, error: 'You do not have an approved booking for this ride.' });
        }
        if (passenger.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, error: 'You have already paid for this ride.' });
        }

        const accessToken = await getPayPalAccessToken();
        const url = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com/v2/checkout/orders'
            : 'https://api-m.sandbox.paypal.com/v2/checkout/orders';

        const currency = process.env.PAYPAL_CURRENCY || 'USD';

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: ride.costPerSeat.toFixed(2),
                    },
                    custom_id: `${rideId}_${userId}`, // Store rideId and userId to verify on capture
                },
            ],
        };

        const response = await axios.post(url, orderData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json({ success: true, order: response.data });
    } catch (error) {
        console.error('PayPal create order error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Could not create PayPal order' });
    }
};

// Capture PayPal Order
exports.capturePayPalOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const accessToken = await getPayPalAccessToken();
        const url = process.env.PAYPAL_MODE === 'live'
            ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`
            : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`;

        const response = await axios.post(url, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const status = response.data.status;
        if (status === 'COMPLETED') {
            const purchaseUnit = response.data.purchase_units[0];
            const customId = purchaseUnit.payments.captures[0].custom_id;
            const [rideId, passengerId] = customId.split('_');

            const ride = await Ride.findById(rideId).populate('passengers.user', 'name');
            if (ride) {
                const passenger = ride.passengers.find(p => p.user._id.toString() === passengerId);
                if (passenger && passenger.paymentStatus !== 'paid') {
                    passenger.paymentStatus = 'paid';
                    await ride.save();

                    // Emit socket notification to the ride room
                    const io = req.app.get('socketio');
                    if (io) {
                        io.to(rideId).emit('paymentSuccess', {
                            message: `Payment received from ${passenger.user.name}`,
                            rideId: rideId,
                            passengerId: passengerId,
                        });
                    }
                }
            }
            res.status(200).json({ success: true, data: response.data });
        } else {
            res.status(400).json({ success: false, error: 'Payment was not completed successfully' });
        }
    } catch (error) {
        console.error('PayPal capture order error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Could not capture PayPal order' });
    }
};