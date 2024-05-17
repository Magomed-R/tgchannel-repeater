"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const fs_1 = __importDefault(require("fs"));
const events_1 = require("telegram/events");
const { API_ID, API_HASH, CHANNEL_1, CHANNEL_2 } = process.env;
const string_session = fs_1.default.readFileSync("session_string.txt", "utf-8");
if (!string_session) {
    console.log("Вам сначала необходимо создать сессию. Для этого введите node get_session.js в терминале");
    process.exit();
}
const session = new sessions_1.StringSession(string_session);
const client = new telegram_1.TelegramClient(session, Number(API_ID), API_HASH, {});
client.connect();
client.addEventHandler(async (event) => {
    const sender = event.message.sender;
    const text = `${event.message.message}\n\n<a href="t.me/${sender.username}/${event.message.id}">ИСТОЧНИК</a>`;
    let sended_message;
    if (event.message.media) {
        sended_message = await client.sendFile(CHANNEL_1, {
            caption: text,
            file: event.message.media,
            parseMode: "html",
        });
    }
    else {
        sended_message = await client.sendMessage(CHANNEL_1, {
            message: text,
            file: event.message.media,
            parseMode: "html",
            linkPreview: false,
        });
    }
    if (event.message.message.length > 0) {
        const channel = await sended_message.getChat();
        const channel_url = `https://t.me/${channel.username}`;
        const post_url = `${channel_url}/${sended_message.id}`;
        const cut_message = `${event.message.message.split("\n")[0]} <a href="${post_url}">ПОДРОБНОСТИ...</a>\n<a href="${channel_url}">Подробности/подписка</a>`;
        await client.sendMessage(CHANNEL_2, {
            message: cut_message,
            parseMode: "html",
            linkPreview: false,
        });
    }
}, new events_1.NewMessage({}));
