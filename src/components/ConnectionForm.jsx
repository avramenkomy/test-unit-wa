function ConnectionForm(props) {
  const {
    apiUrl, idInstance, apiTokenInstance,
    onApiUrlChange, onIdInstanceChange, onApiTokenInstanceChange,
    onConnect, result,
  } = props;

  const handleSubmit = event => {
    event.preventDefault();
    onConnect();
  }

  return (
    <div className="connection">
      <form className="connection__form" onSubmit={handleSubmit}>
        <h1>Client like WhatsApp</h1>

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

        <button type="submit">Connect</button>

        {result && <p>{result}</p>}
      </form>
    </div>
  )
}

export default ConnectionForm;