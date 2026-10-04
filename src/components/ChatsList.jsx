function ChatsList({ chats, onSelectChat, activeChatId, isChatLoading }) {


  function formatTimeChat(timestamp) {
    if (!timestamp) return '';

    return new Date(timestamp * 1000).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }


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
              <div className="chat-list__heading">
                <span className="chat-list__name">
                  {chat.name || chat.id}
                </span>

                {chat.lastMessageTimestamp &&
                  <span className="chat-list__time">
                    {formatTimeChat(chat.lastMessageTimestamp)}
                  </span>
                }
              </div>

              <span className="chat-list__phone">
                {chat.lastMessage || chat.id.replace('@c.us', '')}
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
