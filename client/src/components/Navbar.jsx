import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/auth/authSlice';
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                <Link to="/" className="text-2xl font-bold text-slate-800 hover:text-primary transition-colors">Co-Ride</Link>
                <nav>
                    <ul className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user?.data?.role === 'Admin' && (
                                    <li><Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">Admin</Link></li>
                                )}
                                <li><Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary">Dashboard</Link></li>
                                <li><Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary">Profile</Link></li>
                                <li>
                                    <Button onClick={onLogout} variant="destructive" size="sm">Logout</Button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link></li>
                                <li><Link to="/register"><Button size="sm">Register</Button></Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;