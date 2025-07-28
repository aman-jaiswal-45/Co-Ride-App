const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { _id: false });

const ChatMessageSchema = new mongoose.Schema({
    user: { name: { type: String, required: true } },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const RideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    from: { text: { type: String, required: true }, lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    to: { text: { type: String, required: true }, lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    departureTime: { type: Date, required: true },
    seatsAvailable: { type: Number, required: true, min: 0 },
    costPerSeat: { type: Number, required: true },
    passengers: [PassengerSchema],
    status: { type: String, enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'], default: 'Scheduled' },
    vehicle: { type: { type: String, required: true }, name: { type: String, required: true }, regNumber: { type: String, required: true } },
    chat: [ChatMessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Ride', RideSchema);