function ChatHeader({ phoneNumber }) {
  return (
    <header className="chat-header">
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
