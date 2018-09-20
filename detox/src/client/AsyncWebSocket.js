const _ = require('lodash');
const util = require('util');
const log = require('../utils/logger').child({ __filename, class: 'AsyncWebSocket' });
const WebSocket = require('ws');

class AsyncWebSocket {

  constructor(url) {
    this.log = log.child({ url });
    this.url = url;
    this.ws = undefined;
    this.inFlightPromises = new Map();
    this.eventCallbacks = {};
    this.messageIdCounter = 0;
  }

  async open() {
    return new Promise(async(resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = (response) => {
        this.log.debug({ event: 'WEBSOCKET_OPEN' }, `opened web socket to: ${this.url}`);
        resolve(response);
      };

      this.ws.onerror = (err) => {
        this.log.error({ event: 'WEBSOCKET_ERROR', err }, `caught error: ${err}`);

        const openPromise = this.inFlightPromises.get(0); // NOTE: 0 = OPEN
        if (openPromise) {
          this.inFlightPromises.clear();
          openPromise.reject();
        } else {
          this.rejectAll(err);
        }
      };

      this.ws.onmessage = (response) => {
        this.log.trace({ event: 'WEBSOCKET_MESSAGE' }, `${response.data}`);

        let { type, role, messageId } = JSON.parse(response.data);
        if (type === 'clientDisconnected' && role === 'testee') {
          this.rejectAll(new Error('Instrumentation process has crashed on the device.'));
          return;
        }

        let pendingPromise = this.inFlightPromises.get(messageId);
        if (pendingPromise) {
          pendingPromise.resolve(response.data);
          this.inFlightPromises.delete(messageId);
        }
        let eventCallback = this.eventCallbacks[messageId];
        if (eventCallback) {
          eventCallback(response.data);
        }
      };

      this.inFlightPromises.set(this.messageIdCounter, {resolve, reject});
    });
  }

  async send(message, messageId) {
    if (!this.ws) {
      throw new Error(`Can't send a message on a closed websocket, init the by calling 'open()'. Message:  ${JSON.stringify(message)}`);
    }

    return new Promise(async(resolve, reject) => {
      message.messageId = messageId || this.messageIdCounter++;
      this.inFlightPromises.set(message.messageId, {resolve, reject});
      const messageAsString = JSON.stringify(message);
      this.log.trace({ event: 'WEBSOCKET_SEND' }, messageAsString);
      this.ws.send(messageAsString);
    });
  }

  setEventCallback(eventId, callback) {
    this.eventCallbacks[eventId] = callback;
  }

  async close() {
    return new Promise(async (resolve, reject) => {
      if (this.ws) {
        this.ws.onclose = (message) => {
          this.ws = null;
          resolve(message);
        };

        if (this.ws.readyState !== WebSocket.CLOSED) {
          this.ws.close();
        } else {
          this.ws.onclose();
        }
      } else {
        reject(new Error(`websocket is closed, init the by calling 'open()'`));
      }
    });
  }

  isOpen() {
    if (!this.ws) {
      return false;
    }
    return this.ws.readyState === WebSocket.OPEN;
  }

  rejectAll(error) {
    this.inFlightPromises.forEach((promise) => promise.reject(error));
    this.inFlightPromises.clear();
  }
}

module.exports = AsyncWebSocket;
