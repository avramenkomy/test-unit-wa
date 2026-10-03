function ChatHeader({ phoneNumber, activeContactName, onClose }) {
  const contactTitle = activeContactName || `+${phoneNumber}`;
  return (
    <header className="chat-header">
      <button
        className="chat-header__back"
        type="button"
        onClick={onClose}
        aria-label="Start new chat"
      >&larr;</button>

      <div className="chat-header__avatar">
        {activeContactName
          ? activeContactName
              .split(' ')
              .map(item => item[0])
              .join('')
              .toUpperCase()
          : '?'
        }
      </div>

      <div>
        <strong>{contactTitle}</strong>
        <p>+{phoneNumber}</p>
      </div>
    </header>
  )
}

export default ChatHeader;
