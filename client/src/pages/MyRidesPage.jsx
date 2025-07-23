import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyOfferedRides, getMyBookedRides, reset, startRide, manageBookingRequest, endRide } from '../store/ride/rideSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from '../components/Spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';

const MyRidesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { offeredRides, bookedRides, isLoading } = useSelector((state) => state.rides);
    const { user } = useSelector((state) => state.auth);
    const currentUserId = user?.data?._id;

    const role = user?.data?.role; // Assuming 'Driver' or 'Rider'
    const defaultTab = role === 'Driver' ? 'offered' : 'booked';

    useEffect(() => {
        dispatch(getMyOfferedRides());
        dispatch(getMyBookedRides());
        return () => dispatch(reset());
    }, [dispatch]);

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
                                    {ride.passengers.filter(p => p.status === 'pending').map(p => (
                                        <li key={p.user?._id || p._id} className="flex justify-between items-center p-2 bg-slate-100 rounded-md">
                                            <span>{p.user?.name || 'User name unavailable'}</span>
                                            <div className="space-x-2">
                                                <Button size="sm" disabled={!p.user} onClick={() => handleManageRequest(ride._id, p.user._id, 'approved')}>Approve</Button>
                                                <Button size="sm" disabled={!p.user} variant="destructive" onClick={() => handleManageRequest(ride._id, p.user._id, 'rejected')}>Reject</Button>
                                            </div>
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
                            <CardFooter>
                                {ride.status === 'InProgress' && myBooking?.status === 'approved' && (
                                    <Button className="w-full" variant="secondary" onClick={() => navigate(`/ride/${ride._id}`)}>
                                        Track Live Ride
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
            <Tabs defaultValue={defaultTab} className="w-full">
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
        </div>
    );
};

export default MyRidesPage;