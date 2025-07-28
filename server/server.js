const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const connectDB = require('./config/db');
const Ride = require('./models/Ride');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173',               // Local dev
  'https://co-ride-app.vercel.app',     // Deployed frontend
];
const io = new Server(server, {
    cors: { origin: allowedOrigins, 
            Credentials: true,
            methods: ["GET", "POST"] }
});

// Razorpay Webhook - must be before express.json() for raw body
app.post('/api/rides/payments/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body;
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const rideId = payment.notes.rideId;
            const passengerId = payment.notes.passengerId;

            try {
                const ride = await Ride.findById(rideId).populate('passengers.user', 'name');
                if (ride) {
                    const passenger = ride.passengers.find(p => p.user._id.toString() === passengerId);
                    if (passenger && passenger.paymentStatus !== 'paid') {
                        passenger.paymentStatus = 'paid';
                        await ride.save();
                        console.log(`Payment status updated for user ${passengerId} on ride ${rideId}`);
                        
                        // --- NEW LOGIC ---
                        // Emit an event to the ride room to notify the driver
                        io.to(rideId).emit('paymentSuccess', { 
                            message: `Payment received from ${passenger.user.name}`,
                            rideId: rideId,
                            passengerId: passengerId
                        });
                    }
                }
            } catch (err) {
                console.error('Error in webhook:', err);
            }
        }
    }
    res.status(200).json({ status: 'ok' });
});

app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('joinRide', (rideId) => { socket.join(rideId); });
    socket.on('driverLocationUpdate', (data) => { socket.to(data.rideId).emit('locationUpdate', data.location); });
    socket.on('sendMessage', async (data) => {
        const message = { user: { name: data.user.name }, text: data.text, timestamp: new Date() };
        try {
            await Ride.findByIdAndUpdate(data.rideId, { $push: { chat: message } });
            io.to(data.rideId).emit('receiveMessage', message);
        } catch (error) { console.error('Error saving chat message:', error); }
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/feedback', require('./routes/feedback'));
// app.use('/api/payments', require('./routes/payment'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server running on port ${PORT}`));