import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import { register, reset } from '../store/auth/authSlice';
import Spinner from '../components/Spinner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' });
    const { name, email, password, password2 } = formData;
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error("Registration Error", { description: message });
        }
        if (isSuccess || user) {
            toast.success("Success!", { description: "Registration successful. Welcome!" });
            navigate('/');
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        if (password !== password2) {
            toast.error("Error", { description: "Passwords do not match" });
        } else {
            dispatch(register({ name, email, password }));
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create your account</CardTitle>
                    <CardDescription>
                        Already have an account?  <Link to="/login" className="font-medium text-primary hover:underline ml-1">Sign In</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" type="text" value={name} onChange={onChange} required placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={email} onChange={onChange} required placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" value={password} onChange={onChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password2">Confirm Password</Label>
                            <Input id="password2" name="password2" type="password" value={password2} onChange={onChange} required />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Spinner /> : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterPage;