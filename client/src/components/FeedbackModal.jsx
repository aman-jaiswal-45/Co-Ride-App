import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitFeedback } from '../store/feedback/feedbackSlice';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FeedbackModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('');
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = () => {
        if (!type || !message) {
            toast.error("Please select a type and write a message.");
            return;
        }
        dispatch(submitFeedback({ type, message })).unwrap()
            .then(() => {
                toast.success("Thank you for your feedback!");
                setIsOpen(false);
                setType('');
                setMessage('');
            })
            .catch((error) => {
                toast.error("Feedback submission failed", { description: error });
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Send App Feedback</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit Feedback</DialogTitle>
                    <DialogDescription>
                        Have a suggestion or found a bug? Let us know!
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedbackType">Feedback Type</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger id="feedbackType">
                                <SelectValue placeholder="Select a type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Bug Report">Bug Report</SelectItem>
                                <SelectItem value="Feature Request">Feature Request</SelectItem>
                                <SelectItem value="General Comment">General Comment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Describe your feedback here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Feedback</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackModal;