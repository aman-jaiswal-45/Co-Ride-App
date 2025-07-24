import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getChatHistory, addChatMessage, reset } from '../store/ride/rideSlice';
import io from 'socket.io-client';
import LiveMap from '../components/LiveMap';
import ChatBox from '../components/ChatBox';
import Spinner from '../components/Spinner';

const SOCKET_SERVER_URL = "https://co-ride-app.onrender.com";

const ActiveRidePage = () => {
    const { rideId } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { chatHistory, isLoading } = useSelector(state => state.rides);
    const socketRef = useRef(null);

    const [driverLocation, setDriverLocation] = useState(null);
    const [initialCenter, setInitialCenter] = useState([23.2599, 77.4126]); // Default to Bhopal

    useEffect(() => {
        // Get the user's current location once when the component loads
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setInitialCenter([latitude, longitude]);
            },
            () => {
                console.log("Could not get location, using default.");
            }
        );

        // ... the rest of the existing useEffect logic for sockets, etc.
    }, []);

    useEffect(() => {
        // Fetch initial chat history
        dispatch(getChatHistory(rideId));
        
        // Connect to the socket server
        socketRef.current = io(SOCKET_SERVER_URL);

        // Join the specific ride room
        socketRef.current.emit('joinRide', rideId);

        // Listen for location updates
        socketRef.current.on('locationUpdate', (location) => {
            setDriverLocation(location);
        });

        // Listen for new messages
        socketRef.current.on('receiveMessage', (message) => {
            dispatch(addChatMessage(message)); // Add new message to Redux state
        });
        
        // Geolocation for driver
        let watchId;
        if (user?.data?.role === 'Driver') {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = { lat: latitude, lng: longitude };
                    socketRef.current.emit('driverLocationUpdate', { rideId, location });
                },
                (error) => console.error("Geolocation Error:", error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }

        // Cleanup on component unmount
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            socketRef.current.disconnect();
            dispatch(reset()); // Reset ride slice state
        };
    }, [rideId, user?.data?.role, dispatch]);

    const handleSendMessage = (text) => {
        socketRef.current.emit('sendMessage', {
            rideId,
            user: { name: user.data.name },
            text,
        });
    };

    if (isLoading && chatHistory.length === 0) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="container mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[80vh]">
            <div className="lg:col-span-2 w-[80%] mx-auto p-4 border border-gray-300 rounded-lg shadow-sm"> 
                {/* <LiveMap driverLocation={driverLocation} /> */}
                {/*When rendering the map, you would pass this new state: */}
                <LiveMap driverLocation={driverLocation} initialCenter={initialCenter} />
            </div>
            <div className="lg:col-span-1 flex flex-col h-full">
                <ChatBox messages={chatHistory} onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default ActiveRidePage;