import { useEffect, useRef } from 'react';


function MessageList({ messages }) {

  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = timestamp => {
    if (!timestamp) {
      return '';
    }

    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <div className="message-list">
      {messages.map(message => (
        <div
          key={message.id}
          className={`message ${
            message.direction === 'outgoing'
              ? 'message--outgoing'
              : 'message--incoming'
            }`}
        >
          <p>{message.text}</p>

          <span className="message__time">{formatTime(message.timestamp)}</span>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList;
