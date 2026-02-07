// Chat Service - Team messaging operations
// Implements basic text chat for teams (US4)

import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { chatMessageConverter } from '../converters/team.converters';
import type { ChatMessage } from '@/types/domain/team.types';

/**
 * Send a message to team chat
 */
export async function sendMessage(
    teamId: string,
    content: string,
    senderId: string,
    senderName: string
): Promise<string> {
    const chatRef = collection(db, `teams/${teamId}/chat`)
        .withConverter(chatMessageConverter);

    const newMessage = {
        content,
        senderId,
        senderName,
        timestamp: new Date(),
    };

    const docRef = await addDoc(chatRef, newMessage as any);
    return docRef.id;
}

/**
 * Get chat messages for a team
 * @param teamId Team ID
 * @param limitCount Maximum number of messages to return (default: 50)
 */
export async function getChatMessages(
    teamId: string,
    limitCount: number = 50
): Promise<ChatMessage[]> {
    const chatRef = collection(db, `teams/${teamId}/chat`)
        .withConverter(chatMessageConverter);

    const q = query(chatRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    // Return in chronological order (oldest first)
    return snapshot.docs.map(doc => doc.data()).reverse();
}

/**
 * Subscribe to real-time chat messages
 * @param teamId Team ID
 * @param callback Function called when messages update
 * @param limitCount Maximum number of messages to return (default: 50)
 * @returns Unsubscribe function
 */
export function subscribeToMessages(
    teamId: string,
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
): Unsubscribe {
    const chatRef = collection(db, `teams/${teamId}/chat`)
        .withConverter(chatMessageConverter);

    const q = query(chatRef, orderBy('timestamp', 'desc'), limit(limitCount));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => doc.data()).reverse();
        callback(messages);
    });
}
