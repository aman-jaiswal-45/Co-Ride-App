import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyOfferedRides, getMyBookedRides, reset, startRide, endRide , manageBookingRequest } from '../store/ride/rideSlice';
import { createOrder } from '../store/payment/paymentSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from '../components/Spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReviewModal from '../components/ReviewModal';

const MyRidesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { offeredRides, bookedRides, isLoading } = useSelector((state) => state.rides);
    const { user } = useSelector((state) => state.auth);
    const { isLoading: isPaymentLoading } = useSelector((state) => state.payment);
    const currentUserId = user?.data?._id;

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState({ rideId: null, revieweeId: null, revieweeName: '' });
    const [paymentProcessingId, setPaymentProcessingId] = useState(null);

    // useEffect(() => {
    //     dispatch(getMyOfferedRides());
    //     dispatch(getMyBookedRides());
    //     return () => dispatch(reset());
    // }, [dispatch]);
    useEffect(() => {
        // We fetch offeredRides globally now, but still need bookedRides here.
        dispatch(getMyBookedRides());
        return () => dispatch(reset());
    }, [dispatch]);

    const handleOpenReviewModal = (rideId, revieweeId, revieweeName) => {
        setReviewTarget({ rideId, revieweeId, revieweeName });
        setIsReviewModalOpen(true);
    };

    const handleStartRide = (rideId) => {
        dispatch(startRide(rideId)).unwrap()
            .then(() => {
                toast.success("Ride started!");
                navigate(`/ride/${rideId}`);
            })
            .catch((error) => toast.error("Failed to start ride", { description: error }));
    };
    
    const handleManageRequest = (rideId, passengerId, status) => {
        dispatch(manageBookingRequest({ rideId, passengerId, status })).unwrap()
            .then(() => toast.success(`Request has been ${status}.`))
            .catch((error) => toast.error("Action failed", { description: error }));
    };

    const handleEndRide = (rideId) => {
        dispatch(endRide(rideId)).unwrap()
            .then(() => {
                toast.success("Ride has been marked as completed.");
            })
            .catch((error) => toast.error("Failed to end ride", { description: error }));
    };

    const handlePayment = (ride) => {
        setPaymentProcessingId(ride._id);
        dispatch(createOrder(ride._id)).unwrap()
            .then((res) => {
                const { order } = res;
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "Co-Ride",
                    description: `Payment for ride to ${ride.to.text}`,
                    order_id: order.id,
                    handler: function (response) {
                        toast.success("Payment successful!");
                        navigate('/dashboard');
                    },
                    modal: {
                        ondismiss: function() {
                            setPaymentProcessingId(null); // Re-enable button if modal is closed
                        }
                    },
                    prefill: {
                        name: user.data.name,
                        email: user.data.email,
                    },
                    theme: { color: "#3399cc" }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            })
            .catch((error) => {
                toast.error("Payment failed", { description: error });
                setPaymentProcessingId(null);
            });
    };

    const renderOfferedRides = () => {
        if (isLoading) return <div className="flex justify-center mt-10"><Spinner /></div>;
        if (offeredRides.length === 0) return <p className="text-center text-slate-500 mt-10">You have not offered any rides.</p>;
        
        return (
            <div className="space-y-6">
                {offeredRides.map(ride => (
                    <Card key={ride._id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{ride.from.text} → {ride.to.text}</CardTitle>
                                    <CardDescription>{format(new Date(ride.departureTime), 'PPpp')}</CardDescription>
                                </div>
                                <Badge variant={ride.status === 'Completed' ? 'default' : 'secondary'}>{ride.status}</Badge>
                            </div>
                        </CardHeader>
                        {ride.status === 'Scheduled' && (
                            <CardContent>
                            <h4 className="font-semibold mb-2">Booking Requests</h4>
                            {ride.passengers && ride.passengers.filter(p => p.status === 'pending').length > 0 ? (
                                <ul className="space-y-2">
                                    {ride.passengers.map(p => (
                                        <li key={p.user?._id || p._id} className="flex justify-between items-center p-2 bg-slate-100 rounded-md">
                                            <span>{p.user?.name || '...'}</span>
                                            {p.status === 'pending' ? (
                                                <div className="space-x-2">
                                                    <Button size="sm" disabled={!p.user} onClick={() => handleManageRequest(ride._id, p.user._id, 'approved')}>Approve</Button>
                                                    <Button size="sm" disabled={!p.user} variant="destructive" onClick={() => handleManageRequest(ride._id, p.user._id, 'rejected')}>Reject</Button>
                                                </div>
                                            ) : (
                                                // --- NEW LOGIC ---
                                                <Badge variant={p.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                                    {p.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No pending requests.</p>}
                        </CardContent>
                        )}
                        <CardFooter className="flex justify-end space-x-2">
                             {ride.status === 'Scheduled' && (
                                <Button onClick={() => handleStartRide(ride._id)}>Start Ride</Button>
                            )}
                             {ride.status === 'InProgress' && (
                                <>
                                    <Button variant="destructive" onClick={() => handleEndRide(ride._id)}>End Ride</Button>
                                    <Button variant="secondary" onClick={() => navigate(`/ride/${ride._id}`)}>Go to Active Ride</Button>
                                </>
                            )}
                            {ride.status === 'Completed' && ride.passengers.length>0 && (
                                <div className="pt-2 border-t border-b">
                                    <h4 className="font-bold mb-2 text-sm">Review Your Passengers</h4>
                                    {ride.passengers.filter(p => p.status === 'approved').map(p => (
                                        <div key={p.user._id} className="flex justify-between items-center mb-2 gap-3">
                                            <span className='font-semibold text-sm'>{p.user.name}</span>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenReviewModal(ride._id, p.user._id, p.user.name)}>
                                                Leave Review
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    };
    
     const renderBookedRides = () => {
        if (isLoading) return <div className="flex justify-center mt-10"><Spinner /></div>;
        if (bookedRides.length === 0) return <p className="text-center text-slate-500 mt-10">You have not booked any rides.</p>;
        
        const getStatusBadge = (status) => {
            switch (status) {
                case 'approved': return <Badge>Approved</Badge>;
                case 'pending': return <Badge variant="secondary">Pending</Badge>;
                case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
                default: return null;
            }
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookedRides.map(ride => {
                    const myBooking = ride.passengers.find(p => p.user === currentUserId);
                    const isPaymentProcessing = paymentProcessingId === ride._id;

                    return (
                        <Card key={ride._id} className="flex flex-col">
                           <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{ride.from.text} → {ride.to.text}</CardTitle>
                                        <CardDescription>By {ride.driver.name}</CardDescription>
                                    </div>
                                    {myBooking && getStatusBadge(myBooking.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{format(new Date(ride.departureTime), 'PPpp')}</p>
                            </CardContent>
                            <CardFooter className="flex-col items-stretch space-y-2">
                                {myBooking?.status === 'approved' && ride.status === 'InProgress' && myBooking.paymentStatus !== 'paid' && (
                                    <Button className="w-full" onClick={() => handlePayment(ride)} disabled={isPaymentProcessing}>
                                        {isPaymentProcessing ? <Spinner /> : `Pay Now (₹${ride.costPerSeat})`}
                                    </Button>
                                )}
                                {myBooking?.paymentStatus === 'paid' && (
                                    <Badge className="w-full justify-center py-2 bg-green-100 text-green-800">Payment Confirmed</Badge>
                                )}
                                {ride.status === 'InProgress' && myBooking?.status === 'approved' && (
                                    <Button className="w-full" variant="secondary" onClick={() => navigate(`/ride/${ride._id}`)}>
                                        Track Live Ride
                                    </Button>
                                )}
                                {ride.status === 'Completed' && myBooking?.status === 'approved' && (
                                    <Button className="w-full" onClick={() => handleOpenReviewModal(ride._id, ride.driver._id, ride.driver.name)}>
                                        Review Driver
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">My Rides</h1>
            <Tabs defaultValue="booked" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="booked">Rides I've Booked</TabsTrigger>
                    <TabsTrigger value="offered">Rides I'm Offering</TabsTrigger>
                </TabsList>
                <TabsContent value="booked" className="mt-6">
                    {renderBookedRides()}
                </TabsContent>
                <TabsContent value="offered" className="mt-6">
                    {renderOfferedRides()}
                </TabsContent>
            </Tabs>
            <ReviewModal 
                isOpen={isReviewModalOpen}
                setIsOpen={setIsReviewModalOpen}
                rideId={reviewTarget.rideId}
                revieweeId={reviewTarget.revieweeId}
                revieweeName={reviewTarget.revieweeName}
            />
        </div>
    );
}; 

export default MyRidesPage;