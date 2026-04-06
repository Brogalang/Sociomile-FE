import { useEffect, useState } from "react";
import { getMessages, sendMessage } from "../services/conversationService";

export default function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    const data = await getMessages(conversationId);
    setMessages(data);
  };

  const handleSend = async () => {
    await sendMessage(conversationId, text);
    setText("");
    loadMessages();
  };

  return (
    <div>
      <h3>Chat</h3>

      <div>
        {messages.map((m) => (
          <p key={m.id}>{m.message}</p>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleSend}>
        Send
      </button>
    </div>
  );
}