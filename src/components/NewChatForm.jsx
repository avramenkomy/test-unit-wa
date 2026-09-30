import { useState } from 'react';


function NewChatForm (props) {
  const { phoneNumber, onPhoneNumberChange, onCreateChat } = props;

  const [errorPhoneNumber, setErrorPhoneNumber] = useState('');

  const handleSubmit = event => {
    event.preventDefault();

    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');

    if (normalizedPhoneNumber.length < 10 || normalizedPhoneNumber.length > 15) {
      setErrorPhoneNumber('Please, enter valid phone number.');
      return;
    }

    setErrorPhoneNumber('');
    onCreateChat();
  }

  const handlePhoneNumberInput = event => {
    onPhoneNumberChange(event.target.value);
    setErrorPhoneNumber('');
  }

  return (
    <form className="new-chat-form" onSubmit={handleSubmit}>
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberInput}
        placeholder="Enter phone number"
        aria-invalid={Boolean(errorPhoneNumber)}
      />

      {errorPhoneNumber && <p className="form-error" role="alert">
        {errorPhoneNumber}
      </p>}

      <button type="submit">Go talking</button>
    </form>
  )
}

export default NewChatForm;
