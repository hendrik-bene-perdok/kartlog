'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/domain/team.types';
import { subscribeToMessages, sendMessage } from '@/lib/firebase/services/chat.service';

interface TeamChatProps {
    teamId: string;
    currentUserId: string;
    currentUserName: string;
}

export function TeamChat({ teamId, currentUserId, currentUserName }: TeamChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Subscribe to real-time messages
    useEffect(() => {
        const unsubscribe = subscribeToMessages(teamId, (newMessages) => {
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [teamId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        setError(null);

        try {
            await sendMessage(teamId, newMessage.trim(), currentUserId, currentUserName);
            setNewMessage('');
            inputRef.current?.focus();
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const messageDate = new Date(date);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
    let currentDateGroup: { date: string; messages: ChatMessage[] } | null = null;

    messages.forEach(message => {
        const dateStr = formatDate(message.timestamp);

        if (!currentDateGroup || currentDateGroup.date !== dateStr) {
            currentDateGroup = { date: dateStr, messages: [] };
            groupedMessages.push(currentDateGroup);
        }

        currentDateGroup.messages.push(message);
    });

    return (
        <div className="flex flex-col h-[600px] bg-white border rounded-lg">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Team Chat
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                    </div>
                )}

                {groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {/* Date Separator */}
                        <div className="flex items-center gap-4 my-4">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="text-xs text-gray-500 font-medium">{group.date}</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        {/* Messages for this date */}
                        {group.messages.map((message) => {
                            const isOwnMessage = message.senderId === currentUserId;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                                >
                                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                                        {!isOwnMessage && (
                                            <span className="text-xs text-gray-600 font-medium mb-1 ml-3">
                                                {message.senderName}
                                            </span>
                                        )}
                                        <div
                                            className={`rounded-lg px-4 py-2 ${isOwnMessage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
                {error && (
                    <div className="text-xs text-red-600 mb-2">{error}</div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        maxLength={500}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center gap-2"
                    >
                        {sending ? (
                            <span className="text-sm">...</span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span className="text-sm">Send</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
