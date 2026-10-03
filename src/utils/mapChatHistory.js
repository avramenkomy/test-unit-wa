/**
 * @function
 * @name mapChatHistory
 * @description Маппер истории выбранного чата.
 * - Отфильтровываем только текстовые сообщения соответственно заданию.
 *   Впоследствии приложение можно расширить на работу с картинками, видео,
 *   аудио и документами.
 * - в "map" выбераются только необходимые поля для фронтенда
 * - "reverse" обращает массив сообщений в обратном порядке, чтобы
 *   история шла от самого раннего к самому позднему сообщению.
 *
 * @param {Array<object>} history массив объектов с сообщениями
 *
 * @returns {Array<object>} массив с приведенными объектами сообщений.
 */
export const mapChatHistory = history => {
  return history
    .filter(msg => msg.textMessage)
    .map(msg => ({
      id: msg.idMessage,
      text: msg.textMessage,
      direction: msg.type,
      timestamp: msg.timestamp,
      chatId: msg.chatId,
    }))
    .reverse();
}
