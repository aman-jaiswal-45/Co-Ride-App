import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

const ChatBox = ({ messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <Card className="flex flex-col h-full bg-yellow-50 mr-5">
            <CardHeader>
                <CardTitle>Ride Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="flex items-baseline space-x-2">
                            <span className="font-bold text-sm">{msg.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(msg.timestamp), 'p')}
                            </span>
                        </div>
                        <p className="text-sm bg-slate-100 p-2 rounded-lg">{msg.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </CardContent>
            <form onSubmit={handleSend} className="p-4 border-t flex space-x-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit">Send</Button>
            </form>
        </Card>
    );
};

export default ChatBox;