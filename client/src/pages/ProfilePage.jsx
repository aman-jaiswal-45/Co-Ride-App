import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, getUserProfile, reset } from '../store/user/userSlice';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Spinner from '../components/Spinner';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector(state => state.user);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Rider',
        vehicleDetails: {
            type: 'Car',
            name: '',
            regNumber: ''
        }
    });

    useEffect(() => {
        dispatch(getUserProfile());
        return () => dispatch(reset());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                role: profile.role || 'Rider',
                vehicleDetails: {
                    type: profile.vehicleDetails?.type || 'Car',
                    name: profile.vehicleDetails?.name || '',
                    regNumber: profile.vehicleDetails?.regNumber || ''
                }
            });
        }
    }, [profile]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onVehicleChange = (e) => {
        setFormData({ ...formData, vehicleDetails: { ...formData.vehicleDetails, [e.target.name]: e.target.value } });
    };
    
    const onRoleChange = (value) => {
        setFormData({ ...formData, role: value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUserProfile(formData)).unwrap()
            .then(() => toast.success("Profile updated successfully!"))
            .catch((error) => toast.error("Failed to update profile", { description: error }));
    };

    if (isLoading && !profile) {
        return <div className="flex justify-center mt-10"><Spinner /></div>;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal and vehicle details here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={onChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                             <RadioGroup onValueChange={onRoleChange} value={formData.role} className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Rider" id="r1" />
                                    <Label htmlFor="r1">Rider</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Driver" id="r2" />
                                    <Label htmlFor="r2">Driver</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {formData.role === 'Driver' && (
                            <Card className="p-4 bg-slate-50">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-lg">Vehicle Details</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                     <div className="space-y-2">
                                        <Label>Vehicle Type</Label>
                                         <RadioGroup onValueChange={(val) => onVehicleChange({target: {name: 'type', value: val}})} value={formData.vehicleDetails.type} className="flex space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Car" id="v1" />
                                                <Label htmlFor="v1">Car</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Bike" id="v2" />
                                                <Label htmlFor="v2">Bike</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicleName">Vehicle Name</Label>
                                        <Input id="vehicleName" name="name" value={formData.vehicleDetails.name} onChange={onVehicleChange} placeholder="e.g., Maruti Swift" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="regNumber">Registration Number</Label>
                                        <Input id="regNumber" name="regNumber" value={formData.vehicleDetails.regNumber} onChange={onVehicleChange} placeholder="e.g., MP04AB1234" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Spinner /> : 'Update Profile'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;