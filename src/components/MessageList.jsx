function MessageList({ messages }) {
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
        </div>
      ))}
    </div>
  )
}

export default MessageList;
