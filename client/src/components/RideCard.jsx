import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { bookRide } from '../store/ride/rideSlice';
import { toast } from 'sonner';

const RideCard = ({ ride }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const handleRequestRide = () => {
        dispatch(bookRide(ride._id)).unwrap()
            .then(() => {
                toast.success("Request sent successfully!");
            })
            .catch((error) => {
                toast.error("Request failed", { description: error });
            });
    };

    const isDriver = user?.data?._id === ride.driver._id;
    const passengerInfo = ride.passengers.find(p => p.user.toString() === user?.data?._id);

    const getButtonState = () => {
        if (isDriver) return { text: "Your Ride", disabled: true };
        if (passengerInfo) {
            if (passengerInfo.status === 'pending') return { text: "Request Sent", disabled: true };
            if (passengerInfo.status === 'approved') return { text: "Approved", disabled: true };
            if (passengerInfo.status === 'rejected') return { text: "Rejected", disabled: true, variant: "destructive" };
        }
        if (ride.seatsAvailable === 0) return { text: "Full", disabled: true };
        return { text: "Request to Book", disabled: false, action: handleRequestRide };
    };

    const buttonState = getButtonState();

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl">{ride.from.text} → {ride.to.text}</CardTitle>
                <CardDescription>By {ride.driver.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Departure:</strong> {format(new Date(ride.departureTime), 'PPpp')}</p>
                    <p><strong>Vehicle:</strong> {ride.vehicle.name} ({ride.vehicle.type})</p>
                    <p><strong>Seats Left:</strong> {ride.seatsAvailable}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <p className="text-lg font-bold">₹{ride.costPerSeat}</p>
                <Button onClick={buttonState.action} disabled={buttonState.disabled} variant={buttonState.variant}>
                    {buttonState.text}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RideCard;