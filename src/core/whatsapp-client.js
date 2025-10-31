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
import { supabase } from './supabase-client.js';

export class WhatsappClient {
  constructor(config) {
    this.config = config;
    this.id = config.id;
    this.sock = null;
    this.store = makeInMemoryStore({ logger: logger.child({ level: 'silent', stream: 'store' }) });
    this.status = 'DISCONNECTED';
    this.qr = null;
    this.sessionDir = path.resolve('sessions', this.id);
  }
  
  async updateDbStatus(status, qrCodeUrl = null) {
      const { error } = await supabase
        .from('agents')
        .update({ connection_status: status, qr_code_url: qrCodeUrl })
        .eq('id', this.id);
      if (error) {
          logger.error(error, `Failed to update status in DB for agent ${this.id}`);
      }
  }

  async start() {
    logger.info(`Starting agent: ${this.id} (${this.config.assistantName})`);
    this.status = 'CONNECTING';
    await this.updateDbStatus(this.status);
    
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    
    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: logger.child({ level: 'silent', agent: this.id }),
      browser: ['WA-AI-SaaS', 'Chrome', '1.0.0'],
    });

    this.store.bind(this.sock.ev);

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.qr = qr;
        const qrBase64 = await this.getQrCodeBase64();
        logger.info(`QR code available for agent ${this.id}.`);
        await this.updateDbStatus(this.status, qrBase64);
      }
      
      if (connection === 'close') {
        this.qr = null;
        const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.warn(`Connection closed for agent ${this.id}. Reason: ${lastDisconnect.error}. Reconnecting: ${shouldReconnect}`);
        
        if (shouldReconnect) {
            this.status = 'DISCONNECTED';
            await this.updateDbStatus(this.status, null);
            this.start();
        } else {
            this.status = 'LOGGED_OUT';
            await this.updateDbStatus(this.status, null);
            logger.error(`Agent ${this.id} was logged out. Please re-scan the QR code.`);
        }
      } else if (connection === 'open') {
        this.status = 'CONNECTED';
        this.qr = null;
        await this.updateDbStatus(this.status, null);
        
        const { error } = await supabase
            .from('agents')
            .update({ is_active: true, phone_number: this.getJid().split('@')[0] })
            .eq('id', this.id);
        if (error) logger.error(error, `Failed to set agent ${this.id} to active in DB`);

        logger.info(`Agent ${this.id} connected successfully.`);
      }
    });

    this.sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message) return;
      await handleMessage(msg, this);
    });
  }

  async stop() {
    if (this.sock) {
      await this.sock.logout();
      this.status = 'DISCONNECTED';
      await this.updateDbStatus(this.status, null);
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