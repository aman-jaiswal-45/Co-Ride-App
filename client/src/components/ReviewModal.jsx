import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addReview } from '../store/review/reviewSlice';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import StarRating from './StarRating';

const ReviewModal = ({ isOpen, setIsOpen, rideId, revieweeId, revieweeName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        const reviewData = {
            ride: rideId,
            reviewee: revieweeId,
            rating,
            comment
        };
        dispatch(addReview(reviewData)).unwrap()
            .then(() => {
                toast.success(`Your review for ${revieweeName} has been submitted.`);
                setIsOpen(false);
                setRating(0);
                setComment('');
            })
            .catch((error) => {
                toast.error("Review submission failed", { description: error });
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Review for {revieweeName}</DialogTitle>
                    <DialogDescription>
                        Your feedback is important for building a trustworthy community.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                        <label className="font-medium">Your Rating</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="comment">Comment (optional)</label>
                        <Textarea
                            id="comment"
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;