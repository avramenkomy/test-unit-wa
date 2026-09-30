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
  const [apiUrl, setApiUrl] = useState('');
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [isStartedChat, setIsStartedChat] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState('');


  const handleCheckInstance = async () => {
    try {
      setIsConnecting(true);
      setResult('');

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
      }

      const response = await getStateInstance(requestParams);

      if (response.stateInstance === 'authorized') {
        // setResult('Instance state: authorized');
        setIsConnected(true);
        return;
      }

      setResult(`Instance state: ${response.stateInstance}`);
    } catch (error) {
      console.error('Connection error: ', error);

      setResult('Failed to connect. Please, check credentials for instance.');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };


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
    console.log('Incoming Message: ', incomingMessage);

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
