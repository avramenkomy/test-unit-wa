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
  try {
    const url = `${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=30`;

    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    if (error.response?.status === 408) {
      return null;
    }

    throw error;
  }
}


export const deleteNotification = async ({
  apiUrl, idInstance, apiTokenInstance, receiptId,
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;

  const response = await axios.delete(url);

  return response.data;
}


export const getAllChats = async ({
  apiUrl, idInstance, apiTokenInstance,
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/getChats/${apiTokenInstance}`;

  const response = await axios.get(url);

  return response.data;
};


export const getChatHistory = async ({
  apiUrl, idInstance, apiTokenInstance, chatId, count=50
}) => {
  const url = `${apiUrl}/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`;

  const requestParams = {
    chatId, count,
  }

  const response = await axios.post(
    url,
    requestParams,
  )

  return response.data;
}
