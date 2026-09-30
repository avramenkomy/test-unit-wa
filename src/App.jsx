import { useState } from 'react';
import {
  sendMessage, getStateInstance, receiveNotification, deleteNotification
} from './api/greenApi';

import {
  INCOMING_MESSAGE_RECEIVED,
  TEXT_MESSAGE,
} from './constants';

function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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


  const handleReceiveNotification = async () => {
    try {
      const requestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
      }

      const response = await receiveNotification(requestParams);

      console.log('Notification: ', response);

      if (!response) {
        setResult('New notifications not found.');
        return;
      }

      const { receiptId, body } = response;

      if (body.typeWebhook === INCOMING_MESSAGE_RECEIVED && body.messageData?.typeMessage === TEXT_MESSAGE) {
        const senderName = body.senderData?.senderName;
        const text = body.messageData?.textMessageData?.textMessage;

        console.group('MessageData:');
        console.log('Sender: ', senderName);
        console.log('Message: ', text);
        console.groupEnd();

        setResult(`${senderName}: ${text}`);
      }

      const deleteRequestParams = {
        apiUrl,
        idInstance,
        apiTokenInstance,
        receiptId,
      }

      await deleteNotification(deleteRequestParams);

      console.log(`Notification ${receiptId} has been removed.`);

    } catch (error) {
      console.error('Receive Notification Error: ', error);
      setResult('Notofications receiving error');
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

        {/* Temporary button, must be remove after developing */}
        <button onClick={handleReceiveNotification} type="button">
          Get Notification
        </button>
      </form>

      {result && <p>{result}</p>}
    </main>
  )
}

export default App;
