import { useState } from 'react';


function MessageInput({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();

    const normalizedMessage = message?.trim();

    if (!normalizedMessage) return;

    await onSend(normalizedMessage);

    setMessage('');
  }

  return (
    <form
      className="message-input"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={message}
        onChange={event => setMessage(event.target.value)}
        placeholder='Enter your message'
      />

      <button type="submit">Send</button>
    </form>
  )
}


export default MessageInput;