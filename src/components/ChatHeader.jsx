function ChatHeader({ phoneNumber, onClose }) {
  return (
    <header className="chat-header">
      <button
        className="chat-header__back"
        type="button"
        onClick={onClose}
        aria-label="Start new chat"
      >&larr;</button>

      <div className="chat-header__avatar">
        {phoneNumber.slice(-2)}
      </div>

      <div>
        <strong>LikeWhatsApp</strong>
        <p>+{phoneNumber}</p>
      </div>
    </header>
  )
}

export default ChatHeader;
