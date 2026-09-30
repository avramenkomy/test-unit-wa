function MessageList({ messages }) {

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
    </div>
  )
}

export default MessageList;
