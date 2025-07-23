import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRides, reset } from '../store/ride/rideSlice';
import RideCard from '../components/RideCard';
import Spinner from '../components/Spinner';

const FindRidePage = () => {
    const dispatch = useDispatch();
    const { rides, isLoading, isError, message } = useSelector((state) => state.rides);

    useEffect(() => {
        dispatch(getRides());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    if (isLoading) {
        return <div className="flex justify-center mt-10"><Spinner /></div>;
    }

    if (isError) {
        return <p className="text-center text-red-500 mt-10">Error: {message}</p>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Available Rides</h1>
            {rides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rides.map((ride) => (
                        <RideCard key={ride._id} ride={ride} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <p className="text-slate-500">No available rides found at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default FindRidePage;