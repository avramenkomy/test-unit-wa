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
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState('');


  const handleCheckInstance = async () => {
    try {
      setResult('Checked instance...');

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
      }

      const response = await getStateInstance(requestParams);

      if (response.stateInstance === 'authorized') {
        setResult('Instance state: authorized');
        setIsConnected(true);
        return;
      }

      setResult(`Instance state: ${response.stateInstance}`);
    } catch (error) {
      console.error(error);
      setResult('Failed check instance');
      setIsConnected(false);
    }
  };


  const handleCreateChat = () => {
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');

    if (!normalizedPhoneNumber) return;

    setPhoneNumber(normalizedPhoneNumber);
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
      setResult('Error sending message.');
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
          result={result}
        />
      </main>
    )
  }


  return (
    <main className="app">
      <div className="messenger">
        <aside className="messenger__sidebar">
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
