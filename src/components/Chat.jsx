import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';


function Chat(props) {
  const {
    phoneNumber, activeContactName, messages, onSend, onClose
  } = props;

  return (
    <section className="chat">
      <ChatHeader
        phoneNumber={phoneNumber}
        activeContactName={activeContactName}
        onClose={onClose}
      />

      <MessageList messages={messages} />

      <MessageInput onSend={onSend} />
    </section>
  )
}


export default Chat;
