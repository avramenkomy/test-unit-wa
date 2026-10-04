import { useState, useCallback } from 'react';

import { useNotifications } from './hooks/useNotifications';

import {
  sendMessage,
  getStateInstance,
  getAllChats,
  getChatHistory,
} from './api/greenApi';

import { mapChatHistory } from './utils/mapChatHistory';

import ConnectionForm from './components/ConnectionForm';
import Chat from './components/Chat';
import NewChatForm from './components/NewChatForm';
import ChatsList from './components/ChatsList';

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


  const handleGetAllChats = useCallback(async () => {
    try {
      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
      }

      const response = await getAllChats(requestParams);

      console.log('response all chats: ', response);
      setChats(response);

    } catch (error) {
      console.error('Getting chats error: ', error);
    }
  }, [apiUrl, idInstance, apiTokenInstance]);


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

    } catch (error) {
      console.error('Send message error: ', error);
      throw error;
    }
  }


  // Обработка входящего сообщения:
  // - добавление сообщения в открытый чат
  // - увеличения счетчика непрочитанных сообщений для другого чата
  const handleIncomingMessage = useCallback(incomingMessage => {
    const { chatId } = incomingMessage;

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

    // Для неоткрытого чата, в который пришло сообщение увеличивается счетчик
    // Функциональное обновление позволяет учитывать только актуальное состояние
    // списка чатов.
    setChats(prevState =>
      prevState.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: (chat.unreadCount || 0 ) + 1}
          : chat
      )
    );
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
