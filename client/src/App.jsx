import React , {useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getMyOfferedRides } from './store/ride/rideSlice';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OfferRidePage from './pages/OfferRidePage';
import FindRidePage from './pages/FindRidePage';
import MyRidesPage from './pages/MyRidesPage';
import ProfilePage from './pages/ProfilePage';
import ActiveRidePage from './pages/ActiveRidePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

const SOCKET_SERVER_URL = "http://localhost:5000" || "https://co-ride-app.onrender.com"; // Update with your actual socket server URL

// A new component to handle global socket logic
const SocketManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { offeredRides } = useSelector(state => state.rides);

    // Fetch offered rides as soon as the user is available
    useEffect(() => {
        if (user) {
            dispatch(getMyOfferedRides());
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (user && offeredRides.length > 0) {
            const socket = io(SOCKET_SERVER_URL);
            
            // Join rooms for all offered rides to listen for payments
            offeredRides.forEach(ride => {
                socket.emit('joinRide', ride._id);
            });

            socket.on('paymentSuccess', (data) => {
                toast.success("Payment Received!", {
                    description: data.message,
                    action: {
                        label: "View Rides",
                        onClick: () => navigate('/my-rides'),
                    },
                });
                // Refresh the driver's ride list to show updated payment status
                dispatch(getMyOfferedRides());
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user, offeredRides, dispatch, navigate]);

    return null; // This component does not render anything
};

function App() {
  return (
    <Router>
      <SocketManager />
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/offer-ride" element={<PrivateRoute><OfferRidePage /></PrivateRoute>} />
            <Route path="/find-ride" element={<PrivateRoute><FindRidePage /></PrivateRoute>} />
            <Route path="/my-rides" element={<PrivateRoute><MyRidesPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/ride/:rideId" element={<PrivateRoute><ActiveRidePage /></PrivateRoute>} />

            {/* Protected Admin Route */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          </Routes>
        </main>
        <Toaster richColors />
      </div>
    </Router>
  );
}

export default App;