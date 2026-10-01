function ConnectionForm(props) {
  const {
    apiUrl, idInstance, apiTokenInstance,
    onApiUrlChange, onIdInstanceChange, onApiTokenInstanceChange,
    onConnect, isConnecting, hasEnvCredentials, result,
  } = props;

  const handleSubmit = event => {
    event.preventDefault();
    onConnect();
  }

  return (
    <div className="connection">
      <form className="connection__form" onSubmit={handleSubmit}>
        <div className="connection__header">
          <div className="connection__logo">WA</div>

          <h1>Client like WhatsApp</h1>

          <p>
            {hasEnvCredentials
              ? 'Credentials has been loaded. Connect to start messaging.'
              : 'Enter your GREEN-API credentials for connect.'
            }
          </p>
        </div>

        {!hasEnvCredentials && <div className="connection__fields">
          <label>
            API Url
            <input
              type="text"
              value={apiUrl}
              onChange={event => onApiUrlChange(event.target.value)}
              required
            />
          </label>

          <label>
            idInstance
            <input
              type="text"
              value={idInstance}
              onChange={event => onIdInstanceChange(event.target.value)}
              required
            />
          </label>

          <label>
            apiTokenInstance
            <input
              type="password"
              value={apiTokenInstance}
              onChange={event => onApiTokenInstanceChange(event.target.value)}
              required
            />
          </label>
        </div>}

        {result && <p className="connection__result">{result}</p>}

        <button
          className="connection__button"
          type="submit"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  )
}

export default ConnectionForm;