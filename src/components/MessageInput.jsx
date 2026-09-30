import { useState } from 'react';


function MessageInput({ onSend }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();

    const normalizedMessage = message?.trim();

    if (!normalizedMessage || isSending) return;

    try {
      setIsSending(true);
      setSendError('');

      await onSend(normalizedMessage);

      setMessage('');
    } catch(error) {
      console.error(error);
      setSendError('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  }

  const handleMessageInput = event => {
    setMessage(event.target.value);
    setSendError('');
  }

  return (
    <div className="message-input-wrapper">
      <form
        className="message-input"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={message}
          onChange={handleMessageInput}
          placeholder='Enter your message'
        />

        <button type="submit" disabled={isSending || !message?.trim()}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>

      {sendError && <p className="message-input__error" role="alert">
        {sendError}
      </p>}
    </div>
  )
}


export default MessageInput;