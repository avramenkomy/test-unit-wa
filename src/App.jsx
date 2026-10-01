import { useState, useCallback } from 'react';

import { useNotifications } from './hooks/useNotifications';

import {
  sendMessage, getStateInstance,
} from './api/greenApi';

import ConnectionForm from './components/ConnectionForm';
import Chat from './components/Chat';
import NewChatForm from './components/NewChatForm';

import './App.css';

function App() {
  const envApiUrl = import.meta.env.VITE_GREEN_API_URL ?? '';
  const envIdInstance = import.meta.env.VITE_GREEN_API_ID_INSTANCE ?? '';
  const envApiTokenInstance = import.meta.env.VITE_GREEN_API_TOKEN_INSTANCE ?? '';

  const hasEnvCredentials = Boolean(envApiUrl && envIdInstance && envApiTokenInstance);

  const [apiUrl, setApiUrl] = useState(envApiUrl);
  const [idInstance, setIdInstance] = useState(envIdInstance);
  const [apiTokenInstance, setApiTokenInstance] = useState(envApiTokenInstance);
  const [isStartedChat, setIsStartedChat] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState('');
  

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
  }, [apiUrl, idInstance, apiTokenInstance]);


  const handleCreateChat = () => {
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');

    setPhoneNumber(normalizedPhoneNumber);
    setMessages([]);
    setIsStartedChat(true);
  }


  const handleSendMessage = async text => {
    try {
      const chatId = `${phoneNumber.replace(/\D/g, '')}@c.us`;

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        chatId,
        message: text,
      }

      const response = await sendMessage(requestParams);

      setMessages(prevState => [
        ...prevState,
        {
          id: response.idMessage,
          chatId,
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


  const handleIncomingMessage = useCallback((incomingMessage) => {
    setMessages(prevState => [
      ...prevState,
      {
        ...incomingMessage,
        direction: 'incoming'
      }
    ]);
  }, []);

  useNotifications({
    apiUrl,
    idInstance,
    apiTokenInstance,
    enabled: isConnected,
    onMessage: handleIncomingMessage,
  });


  if (hasEnvCredentials && isConnecting) {
    return (
      <main className="app">
        <div className="connection">
          <p>Connecting to WhatsApp</p>
        </div>
      </main>
    )
  }


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
        </aside>

        {isStartedChat
          ? <Chat
              phoneNumber={phoneNumber}
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
