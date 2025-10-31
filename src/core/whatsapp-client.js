import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import { Boom } from '@hapi/boom';
import logger from '../utils/logger.js';
import { handleMessage } from './message-handler.js';
import path from 'path';

export class WhatsappClient {
  constructor(config) {
    this.config = config;
    this.id = config.id;
    this.sock = null;
    this.store = makeInMemoryStore({ logger: logger.child({ level: 'silent', stream: 'store' }) });
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, LOGGED_OUT
    this.qr = null;
    this.sessionDir = path.resolve('sessions', this.id);
  }

  async start() {
    logger.info(`Starting agent: ${this.id} (${this.config.assistantName})`);
    this.status = 'CONNECTING';
    
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    
    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // We will handle QR code manually
      logger: logger.child({ level: 'silent', agent: this.id }),
      browser: ['WA-AI-SaaS', 'Chrome', '1.0.0'],
    });

    this.store.bind(this.sock.ev);

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        this.qr = qr;
        logger.info(`QR code available for agent ${this.id}.`);
        // The API can now fetch this QR code
      }
      if (connection === 'close') {
        this.qr = null;
        const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.warn(`Connection closed for agent ${this.id}. Reason: ${lastDisconnect.error}. Reconnecting: ${shouldReconnect}`);
        this.status = 'DISCONNECTED';
        if (shouldReconnect) {
          this.start();
        } else {
            this.status = 'LOGGED_OUT';
            logger.error(`Agent ${this.id} was logged out. Please re-scan the QR code.`);
        }
      } else if (connection === 'open') {
        this.status = 'CONNECTED';
        this.qr = null;
        logger.info(`Agent ${this.id} connected successfully.`);
      }
    });

    this.sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
       // Ignore notifications and non-message updates
      if (!msg.message) return;
      
      // Pass the message and this client instance to the handler
      await handleMessage(msg, this);
    });
  }

  async stop() {
    if (this.sock) {
      await this.sock.logout();
      this.status = 'DISCONNECTED';
      logger.info(`Agent ${this.id} has been stopped.`);
    }
  }
  
  async getQrCodeBase64() {
    if (!this.qr) return null;
    try {
        const qrImage = await qrcode.toDataURL(this.qr);
        return qrImage;
    } catch (err) {
        logger.error(err, `Failed to generate QR code for agent ${this.id}`);
        return null;
    }
  }

  getJid() {
    return this.sock?.user?.id;
  }
}
