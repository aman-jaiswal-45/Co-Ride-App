import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, getUserProfile, reset as resetUser } from '../store/user/userSlice';
import { getUserReviews, reset as resetReview } from '../store/review/reviewSlice';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {RadioGroup , RadioGroupItem} from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Upload } from 'lucide-react';
import Spinner from '../components/Spinner';
import { format } from 'date-fns';
import FeedbackModal from '../components/FeedbackModal';
import axios from 'axios';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector(state => state.user);
    const { reviews, isLoading: isReviewLoading } = useSelector(state => state.reviews);
    
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        profilePictureUrl: '',
        vehicleDetails: {
            type: 'Car',
            name: '',
            regNumber: ''
        }
    });

    const [imageUploading, setImageUploading] = useState(false);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    useEffect(() => {
        dispatch(getUserProfile());
        return () => dispatch(resetUser());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                bio: profile.bio || '',
                profilePictureUrl: profile.profilePictureUrl || '',
                vehicleDetails: {
                    type: profile.vehicleDetails?.type || 'Car',
                    name: profile.vehicleDetails?.name || '',
                    regNumber: profile.vehicleDetails?.regNumber || ''
                }
            });
        }
    }, [profile]);

    useEffect(() => {
        if (profile?._id) {
            dispatch(getUserReviews(profile._id));
        }
        return () => {
            dispatch(resetReview());
        }
    }, [profile, dispatch]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!cloudName || !uploadPreset) {
            toast.error("Cloudinary is not configured. Please contact support.");
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('upload_preset', uploadPreset);
        
        setImageUploading(true);
        try {
            const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, uploadFormData);
            const imageUrl = response.data.secure_url;
            setFormData({ ...formData, profilePictureUrl: imageUrl });
            toast.success("Image uploaded successfully!");
        } catch (error) {
            toast.error("Image upload failed. Please try again.");
            console.error(error);
        } finally {
            setImageUploading(false);
        }
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onVehicleChange = (e) => {
        setFormData({ ...formData, vehicleDetails: { ...formData.vehicleDetails, [e.target.name]: e.target.value } });
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
            <div className='md:col-span-1 space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Update your personal and vehicle details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="flex flex-col items-center space-y-2">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={formData.profilePictureUrl} alt={formData.name} />
                                    <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button asChild variant="outline" size="sm">
                                    <label htmlFor="image-upload" className="cursor-pointer flex items-center">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {imageUploading ? 'Uploading...' : 'Upload Image'}
                                        <input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} disabled={imageUploading} accept="image/*" />
                                    </label>
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={onChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bio">Bio (Optional)</Label>
                                <Textarea id="bio" name="bio" value={formData.bio} onChange={onChange} placeholder="Tell us a little about yourself..." />
                            </div>

                            <Card className="p-4 bg-slate-50 border-dashed">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-lg">Vehicle Details</CardTitle>
                                    <CardDescription>Add your vehicle information here to start offering rides.</CardDescription>
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
                                        <Label htmlFor="vehicleName">Vehicle Name / Model</Label>
                                        <Input id="vehicleName" name="name" value={formData.vehicleDetails.name} onChange={onVehicleChange} placeholder="e.g., Maruti Swift" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="regNumber">Registration Number</Label>
                                        <Input id="regNumber" name="regNumber" value={formData.vehicleDetails.regNumber} onChange={onVehicleChange} placeholder="e.g., MP04AB1234" />
                                    </div>
                                </CardContent>
                            </Card>
                        
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? <Spinner /> : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>App Feedback</CardTitle>
                        <CardDescription>Have an idea or found an issue? Let us know.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FeedbackModal />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Reviews</CardTitle>
                        {profile && profile.totalRatings > 0 && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Star className="text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-lg">{profile.averageRating}</span>
                                <span className="text-muted-foreground">({profile.totalRatings} ratings)</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isReviewLoading ? <Spinner /> : (
                            <div className="space-y-4">
                                {reviews.length > 0 ? reviews.map(review => (
                                    <div key={review._id} className="border-b pb-4">
                                        <div className="flex items-center justify-between">
                                            {/* <span className="font-semibold">{review.reviewer.name}</span> */}
                                            <span className="font-semibold">{review.reviewer?.name || 'Unknown User'}</span>
                                            <div className="flex items-center">
                                                {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                                                {[...Array(5 - review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-sm mt-1">{review.comment}</p>
                                        <p className="text-xs text-gray-400 mt-2">{format(new Date(review.createdAt), 'PP')}</p>
                                    </div>
                                )) : <p className="text-muted-foreground">No reviews yet.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage; 