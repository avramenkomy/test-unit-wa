import { useEffect } from 'react';

import {
  receiveNotification, deleteNotification
} from '../api/greenApi';

import { INCOMING_MESSAGE_RECEIVED, TEXT_MESSAGE } from '../constants';

import { sleep } from '../utils';


export const useNotifications = ({
  apiUrl,
  idInstance,
  apiTokenInstance,
  enabled,
  onMessage,
}) => {
  useEffect(
    () => {
      // механихм polling'а запускается только после успешного подключения
      // к GREEN-API
      if (!enabled) return;

      // флаг, необходимый для остановки цикла polling'а при размонтировании
      // компонента или при изменении зависимостей useEffect
      let isActive = true;

      const poll = async () => {
        // цикл постоянно запрашивает новые уведомления, пока
        // хук активен и пользователь подключен
        while (isActive) {
          try {
            const receiveRequestParams = {
              apiUrl,
              idInstance,
              apiTokenInstance,
            }

            // receiveNotification использует long polling:
            // запрос ожидает новое уведомление до receiveTimeout
            const notification = await receiveNotification(receiveRequestParams);

            // если хук был остановлен во время ожидания ответа, то обработка
            // результата прекращается
            if (!isActive) return;

            // без полученного уведомления начинается следующая итерация цикла
            if (!notification) continue;

            const { receiptId, body } = notification;

            // Обработка входящего текстового сообщения.
            // другие типы уведомлений и сообщений пропускаются.
            if (body?.typeWebhook === INCOMING_MESSAGE_RECEIVED && body?.messageData?.typeMessage === TEXT_MESSAGE) {
              const incomingMessage = {
                id: body.idMessage,
                chatId: body.senderData?.chatId,
                senderName: body.senderData?.senderName,
                text: body.messageData?.textMessageData?.textMessage,
                timestamp: body.timestamp,
              }

              // Передача входящего сообщения в App, где будет произведено
              // обновление истории чата, списка чатов, счетчика непрочитанных
              // сообщений
              onMessage(incomingMessage);
            }

            const deleteRequestParams = {
              apiUrl,
              idInstance,
              apiTokenInstance,
              receiptId,
            }

            // после обработки уведомления, его нужно удалить из очереди
            // GREEN-API иначе один и тот же webHook будет приходить повторно
            await deleteNotification(deleteRequestParams);

          } catch (error) {
            console.error('Polling error: ', error);

            // В случае с ошибкой, делается пауза до следующего запроса,
            // чтобы не запустить бесконечный цикл запросов.
            // Это защищает приложение от частых повторных запросов
            // и снижает риск получить 429 Too Many Requests.
            await sleep(3000);
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