import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import Spinner from './Spinner';
import axios from 'axios';

const PayPalModal = ({ isOpen, setIsOpen, ride, token, onPaymentSuccess }) => {
    const [isSdkReady, setIsSdkReady] = useState(false);
    const [paypalClientId, setPaypalClientId] = useState('');
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const paypalButtonContainerRef = useRef(null);

    // Fetch PayPal config on load
    useEffect(() => {
        if (!isOpen) return;

        const fetchConfig = async () => {
            try {
                // Check if VITE env variable is set first
                const envClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
                if (envClientId) {
                    setPaypalClientId(envClientId);
                    setIsLoadingConfig(false);
                    return;
                }

                // Fallback to retrieving from server config
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(import.meta.env.VITE_API_URL + 'payments/config', config);
                setPaypalClientId(res.data.clientId);
                setIsLoadingConfig(false);
            } catch (error) {
                console.error('Failed to load PayPal config:', error);
                toast.error('Payment configuration error', { description: 'Could not load PayPal client ID.' });
                setIsLoadingConfig(false);
            }
        };

        fetchConfig();
    }, [isOpen, token]);

    // Load PayPal SDK script
    useEffect(() => {
        if (!isOpen || !paypalClientId) return;

        const scriptId = 'paypal-sdk-script';
        let script = document.getElementById(scriptId);

        const initPaypal = () => {
            setIsSdkReady(true);
        };

        if (script) {
            // Script already loaded or loading
            if (window.paypal) {
                initPaypal();
            } else {
                script.addEventListener('load', initPaypal);
            }
            return;
        }

        // Load new script
        script = document.createElement('script');
        script.id = scriptId;
        const currency = import.meta.env.VITE_PAYPAL_CURRENCY || 'USD';
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${currency}`;
        script.async = true;
        script.onload = initPaypal;
        script.onerror = () => {
            toast.error('PayPal failed to load', { description: 'Could not load the PayPal SDK.' });
        };
        document.body.appendChild(script);

        return () => {
            if (script && !window.paypal) {
                script.removeEventListener('load', initPaypal);
            }
        };
    }, [isOpen, paypalClientId]);

    // Render PayPal buttons once SDK is ready
    useEffect(() => {
        if (!isOpen || !isSdkReady || !window.paypal || !paypalButtonContainerRef.current) return;

        // Clear container to avoid duplicate button rendering issues
        paypalButtonContainerRef.current.innerHTML = '';

        window.paypal.Buttons({
            createOrder: async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const res = await axios.post(
                        import.meta.env.VITE_API_URL + `payments/create-paypal-order/${ride._id}`,
                        {},
                        config
                    );
                    return res.data.order.id;
                } catch (error) {
                    console.error('PayPal create order error:', error);
                    const errMsg = error.response?.data?.error || 'Could not initiate PayPal transaction.';
                    toast.error('PayPal Error', { description: errMsg });
                    throw new Error(errMsg);
                }
            },
            onApprove: async (data) => {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const res = await axios.post(
                        import.meta.env.VITE_API_URL + `payments/capture-paypal-order/${data.orderID}`,
                        {},
                        config
                    );

                    if (res.data.success) {
                        toast.success('Payment successful!', { description: 'Your ride has been paid.' });
                        onPaymentSuccess();
                        setIsOpen(false);
                    } else {
                        toast.error('Payment verification failed');
                    }
                } catch (error) {
                    console.error('PayPal capture order error:', error);
                    toast.error('Payment Error', { description: error.response?.data?.error || 'Verification failed.' });
                }
            },
            onCancel: () => {
                toast.info('Payment Cancelled', { description: 'You cancelled the PayPal checkout.' });
            },
            onError: (err) => {
                console.error('PayPal button error:', err);
                toast.error('Payment Error', { description: 'An error occurred during the PayPal transaction.' });
            },
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal'
            }
        }).render(paypalButtonContainerRef.current);

    }, [isOpen, isSdkReady, ride, token, setIsOpen, onPaymentSuccess]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                        Confirm payment details for your ride to {ride?.to?.text}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2 border text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Route:</span>
                            <span className="font-semibold">{ride?.from?.text} → {ride?.to?.text}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Driver:</span>
                            <span className="font-semibold">{ride?.driver?.name}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2 text-base font-bold font-sans">
                            <span>Total Amount:</span>
                            <span>₹{ride?.costPerSeat}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center min-h-[150px]">
                        {(isLoadingConfig || (!isSdkReady && paypalClientId)) && (
                            <div className="flex flex-col items-center space-y-2">
                                <Spinner />
                                <span className="text-sm text-muted-foreground">Loading PayPal payment buttons...</span>
                            </div>
                        )}
                        
                        {!paypalClientId && !isLoadingConfig && (
                            <span className="text-sm text-red-500 font-medium">PayPal configuration is missing.</span>
                        )}

                        <div 
                            ref={paypalButtonContainerRef} 
                            className="w-full mt-2" 
                            style={{ display: (isSdkReady && !isLoadingConfig) ? 'block' : 'none' }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PayPalModal;
