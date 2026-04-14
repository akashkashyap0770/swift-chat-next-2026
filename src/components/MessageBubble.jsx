// A single message bubble
// Your messages appear on the right (blue)
// Others' messages appear on the left (gray)

export default function MessageBubble({ message, isOwn }) {
  // Format time like "10:30 AM"
  const time = new Date(message.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  /*
    FIX: Previously senderName was undefined.
    After .populate("sender", "name email"), we get message.sender.name
  */
  const senderName = message.sender?.name || "Unknown";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-xs md:max-w-md`}
      >
        {/* Show sender name only for messages from others */}
        {!isOwn && (
          <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl text-sm ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm" // your message
              : "bg-gray-700 text-white rounded-bl-sm" // others' message
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 mx-1">{time}</span>
      </div>
    </div>
  );
}
