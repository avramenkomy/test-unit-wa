function NewChatForm (props) {
  const { phoneNumber, onPhoneNumberChange, onCreateChat } = props;

  const handleSubmit = event => {
    event.preventDefault();

    if (!phoneNumber) return;

    onCreateChat();
  }

  return (
    <form className="new-chat-form" onSubmit={handleSubmit}>
      <input
        type="tel"
        value={phoneNumber}
        onChange={event => onPhoneNumberChange(event.target.value)}
        placeholder="Enter phone number"
      />

      <button type="submit">Go talking</button>
    </form>
  )
}

export default NewChatForm;
