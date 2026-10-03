function ChatsList({ chats, onSelectChat, activeChatId, isChatLoading }) {
  if (!Array.isArray(chats) || !chats?.length) {
    return <div className="chats-list">
      <p className="chats-list__empty">
        No chats
      </p>
    </div>
  }

  return (
    <div className="chats-list">
      {chats.map(chat => {
        const isActive = chat.id === activeChatId;

        return (
          <button
            key={chat.id}
            className={`chat-list__item ${
              isActive ? 'chat-list__item--active' : ''
            }`}
            type="button"
            onClick={() => onSelectChat(chat)}
            disabled={isChatLoading}
          >
            <div className="chat-list__info">
              <span className="chat-list__name">
                {chat.name || chat.id}
              </span>

              <span className="chat-list__phone">
                {chat.id.replace('@c.us', '')}
              </span>
            </div>

            {chat.unreadCount > 0 && <span className="chat-list__unread">
              {chat.unreadCount}
            </span>}
          </button>
        )
      })}
    </div>
  )
}

export default ChatsList;
