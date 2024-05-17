import { config } from "dotenv";
config();

import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import fs from "fs";
import { NewMessage, NewMessageEvent } from "telegram/events";

const { API_ID, API_HASH, CHANNEL_1, CHANNEL_2 } = process.env;
const string_session = fs.readFileSync("session_string.txt", "utf-8");

if (!string_session) {
    console.log(
        "Вам сначала необходимо создать сессию. Для этого введите node get_session.js в терминале"
    );
    process.exit();
}

const session = new StringSession(string_session);

const client = new TelegramClient(session, Number(API_ID), API_HASH!, {});

client.connect();

client.addEventHandler(async (event: NewMessageEvent) => {
    const sender: any = event.message.sender;

    const text = `${event.message.message}\n\n<a href="t.me/${sender.username}/${event.message.id}">ИСТОЧНИК</a>`;

    let sended_message: Api.Message;

    if (event.message.media) {
        sended_message = await client.sendFile(CHANNEL_1!, {
            caption: text,
            file: event.message.media,
            parseMode: "html",
        });
    } else {
        sended_message = await client.sendMessage(CHANNEL_1!, {
            message: text,
            file: event.message.media,
            parseMode: "html",
            linkPreview: false,
        });
    }

    if (event.message.message.length > 0) {
        const channel: any = await sended_message.getChat();
        const channel_url = `https://t.me/${channel.username}`;
        const post_url = `${channel_url}/${sended_message.id}`;

        const cut_message = `${
            event.message.message.split("\n")[0]
        } <a href="${post_url}">ПОДРОБНОСТИ...</a>\n<a href="${channel_url}">Подробности/подписка</a>`;

        await client.sendMessage(CHANNEL_2!, {
            message: cut_message,
            parseMode: "html",
            linkPreview: false,
        });
    }
}, new NewMessage({}));
