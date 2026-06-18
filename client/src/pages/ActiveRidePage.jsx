import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getChatHistory, getRide, addChatMessage, reset } from '../store/ride/rideSlice';
import io from 'socket.io-client';
import LiveMap from '../components/LiveMap';
import ChatBox from '../components/ChatBox';
import Spinner from '../components/Spinner';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api/', '') 
    : "https://co-ride-app.onrender.com";

const ActiveRidePage = () => {
    const { rideId } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { chatHistory, currentRide, isLoading } = useSelector(state => state.rides);
    const socketRef = useRef(null);

    const [driverLocation, setDriverLocation] = useState(null);

    // Effect 1: Handle ride info fetching & socket connection
    useEffect(() => {
        dispatch(getRide(rideId));
        dispatch(getChatHistory(rideId));

        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: { token: user?.token }
        });
        socketRef.current.emit('joinRide', rideId);
        socketRef.current.on('locationUpdate', (location) => { setDriverLocation(location); });
        socketRef.current.on('receiveMessage', (message) => { dispatch(addChatMessage(message)); });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            dispatch(reset());
        };
    }, [rideId, dispatch, user?.token]);

    // Effect 2: Watch driver location (only if logged-in user is the driver)
    useEffect(() => {
        let watchId;
        const driverId = currentRide?.driver?._id || currentRide?.driver;
        const isDriver = driverId && driverId === user?.data?._id;

        if (isDriver) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = { lat: latitude, lng: longitude };
                    setDriverLocation(location);
                    if (socketRef.current) {
                        socketRef.current.emit('driverLocationUpdate', { rideId, location });
                    }
                },
                (error) => console.error("Geolocation Error:", error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [currentRide, user?.data?._id, rideId]);

    const handleSendMessage = (text) => {
        if (socketRef.current) {
            socketRef.current.emit('sendMessage', {
                rideId,
                user: { name: user.data.name },
                text,
            });
        }
    };

    if (isLoading && chatHistory.length === 0) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="container mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[80vh]">
            <div className="lg:col-span-2 h-full">
                <LiveMap 
                    driverLocation={driverLocation} 
                    from={currentRide?.from} 
                    to={currentRide?.to} 
                />
            </div>
            <div className="lg:col-span-1 h-full flex flex-col">
                <ChatBox messages={chatHistory} onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default ActiveRidePage;