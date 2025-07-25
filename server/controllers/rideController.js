const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create a new ride
exports.createRide = async (req, res) => {
    try {
        const driverId = req.user.id;
        const driver = await User.findById(driverId);

        // MODIFIED: Instead of checking for a 'Driver' role, we check for vehicle details.
        // This is the new gatekeeper for offering a ride.
        if (!driver.vehicleDetails || !driver.vehicleDetails.name || !driver.vehicleDetails.regNumber) {
             return res.status(400).json({ success: false, error: 'Please complete your vehicle details in your profile before offering a ride.' });
        }

        const rideData = { ...req.body, driver: driverId, vehicle: driver.vehicleDetails };
        const ride = await Ride.create(rideData);
        res.status(201).json({ success: true, data: ride });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getRides = async (req, res) => {
    try {
        const rides = await Ride.find({ status: 'Scheduled', departureTime: { $gt: new Date() } }).populate('driver', 'name').sort({ departureTime: 'asc' });
        res.status(200).json({ success: true, count: rides.length, data: rides });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
exports.getMyOfferedRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.user.id }).populate('passengers.user', 'name');
        res.status(200).json({ success: true, data: rides });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
exports.getMyBookedRides = async (req, res) => {
    try {
        const rides = await Ride.find({ 'passengers.user': req.user.id }).populate('driver', 'name');
        res.status(200).json({ success: true, data: rides });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
exports.getChatHistory = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id).select('chat');
        if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
        res.status(200).json({ success: true, data: ride.chat });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
exports.bookRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
        if (ride.driver.toString() === req.user.id.toString()) return res.status(400).json({ success: false, error: 'You cannot book your own ride' });
        const existingPassenger = ride.passengers.find(p => p.user.toString() === req.user.id.toString());
        if (existingPassenger) return res.status(400).json({ success: false, error: 'You have already sent a request for this ride' });
        if (ride.seatsAvailable < 1) return res.status(400).json({ success: false, error: 'This ride is already full' });
        ride.passengers.push({ user: req.user.id, status: 'pending' });
        await ride.save();
        res.status(200).json({ success: true, data: ride });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
exports.manageBookingRequest = async (req, res) => {
    const { status } = req.body;
    const { rideId, passengerId } = req.params;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
        if (ride.driver.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, error: 'You are not authorized to manage this ride' });
        const passengerRequest = ride.passengers.find(p => p.user.toString() === passengerId);
        if (!passengerRequest) return res.status(404).json({ success: false, error: 'Booking request not found' });
        if (passengerRequest.status !== 'pending') return res.status(400).json({ success: false, error: 'This request has already been actioned' });
        if (status === 'approved') {
            if (ride.seatsAvailable < 1) return res.status(400).json({ success: false, error: 'No seats available to approve this request' });
            passengerRequest.status = 'approved';
            ride.seatsAvailable -= 1;
        } else {
            passengerRequest.status = 'rejected';
        }
        await ride.save();
        const updatedRide = await Ride.findById(rideId).populate('passengers.user', 'name');
        res.status(200).json({ success: true, data: updatedRide });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
exports.startRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
        if (ride.driver.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, error: 'You are not authorized to start this ride' });
        if (ride.status !== 'Scheduled') return res.status(400).json({ success: false, error: 'This ride cannot be started' });
        ride.status = 'InProgress';
        await ride.save();
        res.status(200).json({ success: true, data: ride });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};
// @desc    End a ride
// @route   POST /api/rides/:id/end
// @access  Private (Driver only)
exports.endRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
        if (ride.driver.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, error: 'You are not authorized to end this ride' });
        if (ride.status !== 'InProgress') return res.status(400).json({ success: false, error: 'Only a ride in progress can be ended' });
        
        ride.status = 'Completed';
        ride.chat = []; // Clear the chat history
        
        await ride.save();
        res.status(200).json({ success: true, data: ride });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};