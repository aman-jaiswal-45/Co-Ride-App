import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';

const HomePage = () => {
    const {user} = useSelector((state) => state.auth);

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-blue-100/50 via-white to-slate-100/50">
        <div className="container mx-auto px-4 py-24 sm:py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                Share Your Journey, <br/> Split The Costs
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
                Co-Ride connects drivers with empty seats to passengers heading in the same direction. Save money on fuel, reduce traffic, and make your commute more enjoyable.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
                {
                    user ? (
                        <div className="flex items-center gap-x-3">
                            <Link to="/find-ride">
                                <Button size="lg" variant="outline">Find a Ride →</Button>
                            </Link>
                            <Link to="/dashboard">
                                <Button size="lg">Get Started</Button>
                            </Link>
                        </div>
                    ) : (
                        <Link to="/register">
                            <Button size="lg">Get Started</Button>
                        </Link>
                    )
                }
            </div>
        </div>
    </div>
  );
};

export default HomePage;