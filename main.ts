import { config } from "dotenv";
config();

import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import fs from "fs";
import { NewMessage, NewMessageEvent } from "telegram/events";
import VKBot from "node-vk-bot-api";

const { API_ID, API_HASH, CHANNEL_1, CHANNEL_2, VK_TOKEN, VK_CHAT, SEND_VK } =
    process.env;

const vk_bot = new VKBot(VK_TOKEN!);

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

        const sended_message_for_vk = await client.sendMessage(CHANNEL_2!, {
            message: cut_message,
            parseMode: "html",
            linkPreview: false,
        });

        if (SEND_VK!.toLowerCase() === "on") {
            const channel_for_vk: any = await sended_message_for_vk.getChat();

            const cut_message_for_vk = `${
                event.message.message.split("\n")[0]
            } \n Смотри полную ленту с подробностями тут (t.me/${
                channel_for_vk.username
            }/${sended_message_for_vk.id})`;

            await vk_bot.sendMessage(VK_CHAT!, cut_message_for_vk);
        }
    }
}, new NewMessage({}));

vk_bot.command("/id", (ctx) => {
    console.log(ctx);
    ctx.reply("ID текущего чата: " + ctx.message.peer_id);
});

vk_bot.startPolling();
