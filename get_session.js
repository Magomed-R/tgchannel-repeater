const { config } = require("dotenv");
config();

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");

const BOT_TOKEN = process.env.BOT_TOKEN;
const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession("");

(async () => {
    const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Введите номер телефона telegram аккаунта: "),
        password: async () => await input.text("Введите пароль от аккаунта (если есть): "),
        phoneCode: async () => await input.text("Введите код, который пришёл в аккаунт: "),
        onError: (err) => console.log(err),
    });

    fs.writeFileSync("session_string.txt", client.session.save(), "utf-8");

    await client.sendMessage("me", { message: "Hello!" });

    process.exit()
})();
