import { useEffect } from 'react';

import {
  receiveNotification, deleteNotification
} from '../api/greenApi';

import { INCOMING_MESSAGE_RECEIVED, TEXT_MESSAGE } from '../constants';


export const useNotifications = ({
  apiUrl,
  idInstance,
  apiTokenInstance,
  enabled,
  onMessage,
}) => {
  useEffect(
    () => {
      if (!enabled) return;

      let isActive = true;

      const poll = async () => {
        while (isActive) {
          try {
            const receiveRequestParams = {
              apiUrl,
              idInstance,
              apiTokenInstance,
            }

            const notification = await receiveNotification(receiveRequestParams);

            if (!isActive) return;

            if (!notification) continue;

            const { receiptId, body } = notification;

            if (body?.typeWebhook === INCOMING_MESSAGE_RECEIVED && body?.messageData?.typeMessage === TEXT_MESSAGE) {
              const incomingMessage = {
                id: body.idMessage,
                chatId: body.senderData?.chatId,
                senderName: body.senderData?.senderName,
                text: body.messageData?.textMessageData?.textMessage,
                timestamp: body.timestamp,
              }

              onMessage(incomingMessage);
            }

            const deleteRequestParams = {
              apiUrl,
              idInstance,
              apiTokenInstance,
              receiptId,
            }

            await deleteNotification(deleteRequestParams);

          } catch (error) {
            console.error('Polling error: ', error);

            // Бесконечный цикл запросов не запускается в случае ошибки без задержки.
            await new Promise (res => setTimeout(res, 3000));
          }
        }
      }

      poll();

      return () => {
        isActive = false;
      }
    },
    [ apiUrl, idInstance, apiTokenInstance, enabled, onMessage ]
  );
}