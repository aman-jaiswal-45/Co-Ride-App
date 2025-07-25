import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';

const DashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // MODIFIED: Check for vehicle details before navigating to Offer a Ride page
    const handleOfferRideClick = (e) => {
        if (!user.data.vehicleDetails || !user.data.vehicleDetails.name) {
            e.preventDefault(); // Prevent navigation
            toast.info("Please complete your profile!", {
                description: "You need to add your vehicle details before you can offer a ride.",
                action: {
                    label: "Go to Profile",
                    onClick: () => navigate('/profile'),
                },
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Welcome, {user && user.data ? user.data.name : 'User'}!</CardTitle>
                    <CardDescription>This is your dashboard. What would you like to do today?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <Link to="/offer-ride" onClick={handleOfferRideClick}>
                            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Offer a Ride</CardTitle>
                                    <CardDescription>Share your car and split the costs.</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                         <Link to="/find-ride">
                            <Card className="bg-secondary hover:bg-slate-200 transition-colors h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Find a Ride</CardTitle>
                                    <CardDescription>Search for rides to your destination.</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                         <Link to="/my-rides">
                            <Card className="bg-secondary hover:bg-slate-200 transition-colors h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">My Rides</CardTitle>
                                    <CardDescription>View your upcoming and past trips.</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;