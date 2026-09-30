import axios from 'axios';


export const getStateInstance = async ({
  apiUrl,
  idInstance,
  apiTokenInstance,
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;

  const response = await axios.get(url);

  return response.data;
}


export const sendMessage = async ({
  apiUrl,
  idInstance,
  apiTokenInstance,
  chatId,
  message,
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

  const payload = {
    chatId, message,
  }

  const response = await axios.post(
    url,
    payload,
  );

  return response.data;
};


export const receiveNotification = async ({
  apiUrl, idInstance, apiTokenInstance,
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`;

  const response = await axios.get(url);

  return response.data;
}


export const deleteNotification = async ({
  apiUrl, idInstance, apiTokenInstance, receiptId,
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;

  const response = await axios.delete(url);

  return response.data;
}
