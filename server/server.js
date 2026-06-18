const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Ride = require('./models/Ride');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

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

app.set('socketio', io);

app.use(express.json());
app.use(cors());

// Auth Middleware for Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.userId = decoded.id;
        next();
    });
});

io.on('connection', (socket) => {
    socket.on('joinRide', async (rideId) => {
        try {
            const ride = await Ride.findById(rideId);
            if (!ride) return;

            const isDriver = ride.driver.toString() === socket.userId;
            const isApprovedPassenger = ride.passengers.some(
                p => p.user.toString() === socket.userId && p.status === 'approved'
            );

            if (isDriver || isApprovedPassenger) {
                socket.join(rideId);
            } else {
                console.warn(`User ${socket.userId} unauthorized to join ride room ${rideId}`);
            }
        } catch (err) {
            console.error('Error joining ride room:', err);
        }
    });

    socket.on('driverLocationUpdate', async (data) => {
        try {
            const ride = await Ride.findById(data.rideId);
            if (!ride || ride.driver.toString() !== socket.userId) {
                return; // Unauthorized location spoofing attempt!
            }
            socket.to(data.rideId).emit('locationUpdate', data.location);
        } catch (err) {
            console.error('Error in driverLocationUpdate verification:', err);
        }
    });

    socket.on('sendMessage', async (data) => {
        try {
            const ride = await Ride.findById(data.rideId);
            if (!ride) return;

            const isDriver = ride.driver.toString() === socket.userId;
            const isApprovedPassenger = ride.passengers.some(
                p => p.user.toString() === socket.userId && p.status === 'approved'
            );

            if (!isDriver && !isApprovedPassenger) {
                return; // Unauthorized message sending!
            }

            const sender = await User.findById(socket.userId);
            if (!sender) return;

            const message = { 
                user: { name: sender.name, _id: socket.userId }, 
                text: data.text, 
                timestamp: new Date() 
            };

            await Ride.findByIdAndUpdate(data.rideId, { $push: { chat: message } });
            io.to(data.rideId).emit('receiveMessage', message);
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/payments', require('./routes/payment'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server running on port ${PORT}`));