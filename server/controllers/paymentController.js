const Ride = require('../models/Ride');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order for a ride booking
// @route   POST /api/payments/create-order/:rideId
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { rideId } = req.params;
        const userId = req.user.id;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }

        const passenger = ride.passengers.find(p => p.user.toString() === userId && p.status === 'approved');
        if (!passenger) {
            return res.status(403).json({ success: false, error: 'You do not have an approved booking for this ride.' });
        }
        if (passenger.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, error: 'You have already paid for this ride.' });
        }

        const options = {
            amount: ride.costPerSeat * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_ride_${rideId}_${userId}`,
            notes: {
                rideId: rideId,
                passengerId: userId
            }
        };

        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });

    } catch (error) {
        console.error('Razorpay order error:', error);
        res.status(500).json({ success: false, error: 'Could not create payment order' });
    }
};