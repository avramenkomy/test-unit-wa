import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';


function Chat(props) {
  const { phoneNumber, messages, onSend, onClose } = props;

  return (
    <section className="chat">
      <ChatHeader phoneNumber={phoneNumber} onClose={onClose} />

      <MessageList messages={messages} />

      <MessageInput onSend={onSend} />
    </section>
  )
}


export default Chat;
