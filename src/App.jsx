import { useState, useCallback } from 'react';

import { useNotifications } from './hooks/useNotifications';

import {
  sendMessage,
  getStateInstance,
  getAllChats,
  getChatHistory,
} from './api/greenApi';

import { mapChatHistory, sleep } from './utils';

import ConnectionForm from './components/ConnectionForm';
import Chat from './components/Chat';
import NewChatForm from './components/NewChatForm';
import ChatsList from './components/ChatsList';

import {
  CHATS_PREVIEW_LIMIT,
  CHAT_HISTORY_REQUEST_DELAY
} from './constants';

import './App.css';

function App() {
  const envApiUrl = import.meta.env.VITE_GREEN_API_URL ?? '';
  const envIdInstance = import.meta.env.VITE_GREEN_API_ID_INSTANCE ?? '';
  const envApiTokenInstance = import.meta.env.VITE_GREEN_API_TOKEN_INSTANCE ?? '';

  const hasEnvCredentials = Boolean(envApiUrl && envIdInstance && envApiTokenInstance);

  const [apiUrl, setApiUrl] = useState(envApiUrl);
  const [idInstance, setIdInstance] = useState(envIdInstance);
  const [apiTokenInstance, setApiTokenInstance] = useState(envApiTokenInstance);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeContactName, setActiveContactName] = useState('');

  const [isStartedChat, setIsStartedChat] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [result, setResult] = useState('');


  const getChatLastMessage = useCallback(async chat => {
    try {
      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        chatId: chat.id,
        count: 1,
      }

      const response = await getChatHistory(requestParams);
      const mappedMessages = mapChatHistory(response, chat.id);
      const lastMessage = mappedMessages[0];

      if (!lastMessage) return chat;

      return {
        ...chat,
        lastMessage: lastMessage.text,
        lastMessageTimestamp: lastMessage.timestamp,
      }
    } catch (error) {
      console.error('', error);
      return chat;
    }
  },
    [apiUrl, idInstance, apiTokenInstance]
  );


  const handleGetAllChats = useCallback(async () => {
    try {
      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
      }

      const response = await getAllChats(requestParams);

      // Сразу показываеются все чаты без превью
      setChats(response);

      console.log('response all chats: ', response);

      // Т.к. GREEN_API не возвращает последнее сообщение для каждого чата,
      // отдельно нужно получить последнее сообщение из истории чата.
      // Превью загружается последовательно во избежание
      // ошибки 429 Too Many Requests
      const chatsForPreview = response.slice(0, CHATS_PREVIEW_LIMIT);

      for (const [index, chat] of chatsForPreview.entries()) {
        const chatWithLastMessage = await getChatLastMessage(chat);

        setChats(prevState =>
          prevState.map(itemChat =>
            itemChat.id === chatWithLastMessage.id
              ? {
                  ...itemChat,
                  lastMessage: chatWithLastMessage.lastMessage,
                  lastMessageTimestamp: chatWithLastMessage.lastMessageTimestamp,
                }
              : itemChat,
          )
        );

        // пауза между запросами
        if (index < chatsForPreview.length - 1) {
          await sleep(CHAT_HISTORY_REQUEST_DELAY);
        }
      }

    } catch (error) {
      console.error('Getting chats error: ', error);
    }
  }, [apiUrl, idInstance, apiTokenInstance, getChatLastMessage]);


  const handleCheckInstance = useCallback(async () => {
    try {
      setIsConnecting(true);
      setResult('');

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
      };

      const response = await getStateInstance(requestParams);

      if (response.stateInstance === 'authorized') {
        setIsConnected(true);
        await handleGetAllChats();
        return;
      }

      setResult(`Instance state: ${response.stateInstance}`);
    } catch (error) {
      console.error('Connection error: ', error);

      setResult(
        'Failed to connect. Please, check credentials for instance.'
      );

      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [apiUrl, idInstance, apiTokenInstance, handleGetAllChats]);


  const handleSelectChat = async chat => {
    try {
      setIsChatLoading(true);

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        chatId: chat.id,
        count: 50,
      }

      const response = await getChatHistory(requestParams);

      const mappedHistory = mapChatHistory(response);

      const selectedPhoneNumber = chat.id.replace('@c.us', '');

      setPhoneNumber(selectedPhoneNumber);
      setActiveContactName(chat?.name || '');
      setActiveChatId(chat.id);
      setMessages(mappedHistory);
      setIsStartedChat(true);

      // тут добавляется обнуление непрочитанных сообщений
      setChats(prevState =>
        prevState.map(item =>
          item.id === chat.id
            ? { ...item, unreadCount: 0 }
            : item
        )
      );

      console.log('mappenChatHistory: ', mappedHistory, chat);

    } catch (error) {
      console.error('Get chat history error: ', error);
    } finally {
      setIsChatLoading(false);
    }
  }


  const handleCreateChat = () => {
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const chatId = `${normalizedPhoneNumber}@c.us`;

    setPhoneNumber(normalizedPhoneNumber);
    setActiveContactName('');
    setActiveChatId(chatId);
    setMessages([]);
    setIsStartedChat(true);
  }


  const handleSendMessage = async text => {
    if (!activeChatId) return;

    try {
      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        chatId: activeChatId,
        message: text,
      }

      const response = await sendMessage(requestParams);

      setMessages(prevState => [
        ...prevState,
        {
          id: response.idMessage,
          chatId: activeChatId,
          text,
          direction: 'outgoing',
          timestamp: Math.floor(Date.now() / 1000),
        }
      ]);

      // обновление превью чата после отправки сообщения
      setChats(prevState => {
        const chat = prevState.find(itemChat => itemChat.id === activeChatId);

        // для нового чата, который отсутствует в списке чатов
        if (!chat) return prevState;

        const updatedChat = {
          ...chat,
          lastMessage: text,
          lastMessageTimestamp: Math.floor(Date.now() / 1000),
        }

        // Поднятие чата вверх списка
        return [
          updatedChat,
          ...prevState.filter(itemChat => itemChat.id !== activeChatId),
        ]
      });

    } catch (error) {
      console.error('Send message error: ', error);
      throw error;
    }
  }


  // Обработка входящего сообщения:
  // - добавление сообщения в открытый чат
  // - обновление последнего сообщения в списке чатов
  // - увеличения счетчика непрочитанных сообщений для другого чата
  // - перемещение чата с новым сообщение в начало списка
  const handleIncomingMessage = useCallback(incomingMessage => {
    const { chatId, text, timestamp } = incomingMessage;
    const isActiveChat = chatId === activeChatId;

    // Обновление информации о чате, в который пришло сообщение
    setChats(prevState => {
      const chat = prevState.find(itemChat => itemChat.id === chatId);

      // Для чата, которого нет в списке ничего не обновляется
      if (!chat) return prevState;

      const updatedChat = {
        ...chat,
        lastMessage: text,
        lastMessageTimestamp: timestamp || Math.floor(Date.now() / 1000),
        unreadCount: isActiveChat
          ? (chat.unreadCount || 0)
          : (chat.unreadCount || 0) + 1,
      }

      // Перемещение чата в начало списка
      return [
        updatedChat,
        ...prevState.filter(itemChat => itemChat.id !== chatId),
      ];
    });


    // Сообщение, приходящее в открытый чат, добавляется в историю сообщений
    if (chatId === activeChatId) {
      setMessages(prevState => [
        ...prevState,
        {
          ...incomingMessage,
          direction: 'incoming',
        }
      ]);

      return;
    }
  }, [activeChatId]);

  useNotifications({
    apiUrl,
    idInstance,
    apiTokenInstance,
    enabled: isConnected,
    onMessage: handleIncomingMessage,
  });


  if (!isConnected) {
    return (
      <main className="app">
        <ConnectionForm
          apiUrl={apiUrl}
          idInstance={idInstance}
          apiTokenInstance={apiTokenInstance}
          onApiUrlChange={setApiUrl}
          onIdInstanceChange={setIdInstance}
          onApiTokenInstanceChange={setApiTokenInstance}
          onConnect={handleCheckInstance}
          isConnecting={isConnecting}
          hasEnvCredentials={hasEnvCredentials}
          result={result}
        />
      </main>
    )
  }


  const handleCloseChat = () => {
    setIsStartedChat(false);
    setPhoneNumber('');
    setActiveContactName('');
    setActiveChatId(null);
    setMessages([]);
  }


  return (
    <main className="app">
      <div className="messenger">
        <aside
          className={`messenger__sidebar ${
            isStartedChat ? 'messenger__sidebar--chat-started' : ''
          }`}
        >
          <h1>Client Is Like WhatsApp</h1>

          {!isStartedChat && (
            <NewChatForm
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              onCreateChat={handleCreateChat}
            />
          )}

          <ChatsList
            chats={chats}
            activeChatId={activeChatId}
            isChatLoading={isChatLoading}
            onSelectChat={handleSelectChat}
          />
        </aside>

        {isChatLoading
          ? <section className="messenger__empty">
              <p>Loading chat...</p>
            </section>

          : isStartedChat
            ? <Chat
                phoneNumber={phoneNumber}
                activeContactName={activeContactName}
                messages={messages}
                onSend={handleSendMessage}
                onClose={handleCloseChat}
              />

            : <section className="messenger__empty">
                <h2>Client Is Like WhatsApp</h2>
                <p>Enter target phone number, to begin chat</p>
              </section>
        }
      </div>
    </main>
  )
}

export default App;
