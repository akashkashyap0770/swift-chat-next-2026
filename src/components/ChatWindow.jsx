"use client";

// ChatWindow.jsx
//
// This component shows the messages and handles sending new ones.
//
// TWO WAYS messages arrive here:
//   1. On load: we fetch OLD messages from the database (one-time fetch)
//   2. Live:    socket pushes NEW messages the moment someone sends them
//
// WHY NOT JUST FETCH EVERY FEW SECONDS?
//   Old apps used setInterval to poll the server every 10 seconds.
//   That wastes bandwidth and feels slow. Sockets are instant.

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import SendMessageForm from "./SendMessageForm";
import MessageBubble from "./MessageBubble";
import toast from "react-hot-toast";

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]); // list of messages to display
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const { user } = useAuth(); // the logged-in user
  const socket = useSocket(); // the live socket connection
  const bottomRef = useRef(null); // reference to the invisible div at the bottom (for auto-scroll)

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Load old messages when the chat opens
  // ─────────────────────────────────────────────────────────────
  // useCallback means this function is only re-created when selectedUser changes,
  // not on every render. This prevents an infinite loop with the useEffect below.
  const fetchOldMessages = useCallback(async () => {
    try {
      // If a user is selected, fetch private messages with them.
      // Otherwise fetch the global chat messages.
      const url = selectedUser
        ? `/api/messages?userId=${selectedUser._id}`
        : "/api/messages";

      const response = await fetch(url);
      if (!response.ok) return;

      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      // silently ignore — socket will still work
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  // Run fetchOldMessages once whenever the selected chat changes
  useEffect(() => {
    setLoading(true);
    setMessages([]); // clear old messages before loading new ones
    fetchOldMessages();
  }, [fetchOldMessages]);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Listen for NEW messages arriving via the socket
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return; // socket not ready yet

    function handleNewMessage(newMessage) {
      const isGlobalChat = !selectedUser;
      const isPrivateChat = !!selectedUser;

      if (isGlobalChat) {
        // Global chat: only show messages where receiver is null (no specific recipient)
        if (!newMessage.receiver) {
          addMessageIfNotDuplicate(newMessage);
        }
      } else if (isPrivateChat) {
        // Private chat: only show messages between the current user and selectedUser.
        // A message belongs to THIS chat if it's:
        //   - from selectedUser to me, OR
        //   - from me to selectedUser
        const senderId = newMessage.sender?._id || newMessage.sender;
        const receiverId = newMessage.receiver?._id || newMessage.receiver;
        const myId = user?._id;
        const theirId = selectedUser._id;

        const isThisOurChat =
          (senderId === theirId && receiverId === myId) || // they sent to me
          (senderId === myId && receiverId === theirId); // I sent to them

        if (isThisOurChat) {
          addMessageIfNotDuplicate(newMessage);
        }
      }
    }

    // Helper: add a message to state, but skip it if we already have it.
    // This prevents duplicates — when I send a message, I add it immediately in handleSend,
    // but the socket also sends it back to me. The duplicate check ignores the second copy.
    function addMessageIfNotDuplicate(newMessage) {
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (m) => m._id === newMessage._id,
        );
        if (alreadyExists) return currentMessages; // don't add it again
        return [...currentMessages, newMessage]; // add to end of list
      });
    }

    // Start listening for messages from the server
    socket.on("new-message", handleNewMessage);

    // Stop listening when the chat changes or component unmounts
    // (otherwise old listeners pile up and fire multiple times)
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedUser, user]);

  // ─────────────────────────────────────────────────────────────
  // Auto-scroll: whenever messages change, scroll to the bottom
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─────────────────────────────────────────────────────────────
  // Send a message
  // ─────────────────────────────────────────────────────────────
  // We POST to our API. The API saves it in MongoDB, then emits it
  // via the socket to the recipient. The socket fires handleNewMessage
  // above for the recipient, showing the message instantly.
  async function handleSend(text) {
    if (!text.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser?._id || null, // null = global chat
          content: text,
        }),
      });

      const savedMessage = await response.json();

      if (!response.ok) {
        toast.error(savedMessage.error || "Failed to send message");
        return;
      }

      // Add our sent message to the list immediately (don't wait for the socket)
      // The duplicate check in handleNewMessage will skip it when the socket echoes it back
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (m) => m._id === savedMessage._id,
        );
        if (alreadyExists) return currentMessages;
        return [...currentMessages, savedMessage];
      });
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-3">
        {selectedUser ? (
          <>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              {selectedUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{selectedUser.name}</p>
              <p
                className={`text-xs ${selectedUser.isOnline ? "text-green-400" : "text-gray-500"}`}
              >
                {selectedUser.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              🌐
            </div>
            <div>
              <p className="text-white font-semibold">Global Chat</p>
              <p className="text-xs text-gray-400">Everyone can see</p>
            </div>
          </>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No messages yet. Say hi! 👋
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
            />
          ))
        )}
        {/* Invisible anchor — we scroll here after new messages arrive */}
        <div ref={bottomRef} />
      </div>

      {/* Message input at the bottom */}
      <SendMessageForm onSend={handleSend} disabled={sending} />
    </div>
  );
}
