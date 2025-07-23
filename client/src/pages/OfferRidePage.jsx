import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createRide } from '../store/ride/rideSlice';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Spinner from '../components/Spinner';

const OfferRidePage = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [departureDate, setDepartureDate] = useState(null);
    const [departureTime, setDepartureTime] = useState('');
    const [seatsAvailable, setSeatsAvailable] = useState(1);
    const [costPerSeat, setCostPerSeat] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to control calendar

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.rides);

    const onSubmit = (e) => {
        e.preventDefault();

        if (!from || !to || !departureDate || !departureTime || !seatsAvailable || !costPerSeat) {
            toast.error("Please fill out all fields.");
            return;
        }

        // Combine date and time
        const [hours, minutes] = departureTime.split(':');
        const combinedDateTime = new Date(departureDate);
        combinedDateTime.setHours(parseInt(hours, 10));
        combinedDateTime.setMinutes(parseInt(minutes, 10));
        combinedDateTime.setSeconds(0);

        if (combinedDateTime < new Date()) {
            toast.error("Departure time cannot be in the past.");
            return;
        }

        const rideData = {
            from: { text: from, lat: 0, lng: 0 }, // Placeholder lat/lng
            to: { text: to, lat: 0, lng: 0 }, // Placeholder lat/lng
            departureTime: combinedDateTime.toISOString(),
            seatsAvailable: Number(seatsAvailable),
            costPerSeat: Number(costPerSeat),
        };
        
        dispatch(createRide(rideData)).unwrap()
            .then(() => {
                toast.success("Ride offered successfully!");
                navigate('/find-ride');
            })
            .catch((error) => {
                 toast.error("Failed to offer ride", { description: error });
            });
    };

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Offer a New Ride</CardTitle>
                    <CardDescription>Fill in the details of your upcoming trip to share it with passengers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g., New Delhi" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g., Jaipur" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="departureDate">Departure Date</Label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !departureDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={departureDate}
                                            onSelect={(date) => {
                                                setDepartureDate(date);
                                                setIsCalendarOpen(false); // Close calendar on select
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="departureTime">Departure Time</Label>
                                <Input id="departureTime" type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="seatsAvailable">Seats Available</Label>
                                <Input id="seatsAvailable" type="number" min="1" max="8" value={seatsAvailable} onChange={(e) => setSeatsAvailable(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="costPerSeat">Cost per Seat (₹)</Label>
                                <Input id="costPerSeat" type="number" min="0" value={costPerSeat} onChange={(e) => setCostPerSeat(e.target.value)} placeholder="e.g., 500" />
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Spinner /> : 'Offer Ride'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default OfferRidePage;