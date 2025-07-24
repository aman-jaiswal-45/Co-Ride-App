const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server running on port ${PORT}`));