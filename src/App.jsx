import { useState } from 'react';
import { sendMessage, getStateInstance } from './api/greenApi';

function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  // const [phoneNumber, setPhoneNumber] = useState('');
  const [chatId, setChatId] = useState('');
  const [messageContent, setMessageContent] = useState('');
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

      console.log('Instance state', response);

      setResult(`Instance state: ${response.stateInstance}`);
    } catch (error) {
      console.error(error);
      setResult('Failed check instance');
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setResult('Sending...');

      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        chatId,
        messageContent,
      }

      const response = await sendMessage(requestParams);

      console.log('Green Api response: ', response);

      setResult(`Message has been send with id:  ${response.idMessage}`);

    } catch (error) {
      console.error(error);
      setResult('Error sending message');
    }
  }

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
            Chat Id

            <input
              value={chatId}
              onChange={event => setChatId(event.target.value)}
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
    </main>
  )
}

export default App;
