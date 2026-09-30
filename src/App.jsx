import { useState, useCallback } from 'react';

import { useNotifications } from './hooks/useNotifications';

import {
  sendMessage, getStateInstance,
} from './api/greenApi';


function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');
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


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setResult('Sending...');

      const chatId = `${phoneNumber.replace(/\D/g, "")}@c.us`;

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        chatId,
        message: messageContent,
      }

      const response = await sendMessage(requestParams);

      console.log('Green Api response: ', response);

      setResult(`Message has been send with id:  ${response.idMessage}`);

    } catch (error) {
      console.error(error);
      setResult('Error sending message');
    }
  }


  const handleIncomingMessage = useCallback((incomingMessage) => {
    console.log('Incoming Message: ', incomingMessage);

    setMessages(prevState => [ ...prevState, incomingMessage]);
  }, []);

  useNotifications({
    apiUrl,
    idInstance,
    apiTokenInstance,
    enabled: isConnected,
    onMessage: handleIncomingMessage,
  });


  return (
    <main>
      <h1>MAX Chat</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            API Url

            <input
              value={apiUrl}
              onChange={event => setApiUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        <div>
          <label>
            idInstance

            <input
              value={idInstance}
              onChange={event => setIdInstance(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            apiTokenInstance
            <input
              value={apiTokenInstance}
              onChange={event => setApiTokenInstance(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Phone Number

            <input
              value={phoneNumber}
              onChange={event => setPhoneNumber(event.target.value)}
              placeholder="79991234567"
            />
          </label>
        </div>

        <div>
          <label>
            Message

            <input
              value={messageContent}
              onChange={event => setMessageContent(event.target.value)}
              placeholder="Please, enter your message"

            />
          </label>
        </div>

        <button type="button" onClick={handleCheckInstance}>
          Check instance
        </button>

        <button type="submit">
          Send
        </button>
      </form>

      {result && <p>{result}</p>}

      <div>
        <h2>Messages</h2>

        {messages.map(message => (
          <div key={message.id}>
            <strong>{message.senderName}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default App;
