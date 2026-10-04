/**
 * @function
 * @name sleep
 * @description задержка по времени для выполнения определенных операций
 *
 * @param {number} delay время задержки в мс
 *
 * @returns {Promise}
 */
export default function sleep(delay) {
  return new Promise(res => setTimeout(res, delay))
}
