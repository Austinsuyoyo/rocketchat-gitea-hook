
# About
[Rocket.Chat](https://rocket.chat/) integrate notifications via an [Incoming Webhook](https://docs.rocket.chat/guides/administrator-guides/integrations) in [Gitea](https://gitea.io/)


# Instructions
## Rocket.Chat
1. Login Rocket.Chat with Administrator

2. Go to Adminisration -> Integrations -> Create a new Incoming webhook
3. Set "**Enabled**" option to **True**
4. Select **Channel/User** that you want to post notification
5. Select an **Account** to post message. In Rocket.Chat can set account role be a BOT
6. Copy/Paste [gitea-rocketchat.hooks.js](https://raw.githubusercontent.com/austinsuyoyo/rocketchat-gitea-hook/master/gitea-rocketchat.hooks.js) to Scripts Block in Rocket.Chat.
7. Set "**Script Enabled**" Option to **True**
7. Save the integration first, then you can copy **Webhook URL** for Gitea trigger.

## Gitea
* System Webhook
    1. Go to **Site Administration** -> **System Webhooks** 
    2. Create New Webook -> Select **Gitea** webhook
    3. Past **Webhook URL** to Target URL
    4. Keep **HTTP Method** as POST
    5. Keep **POST Content Type** as application/json
    6. Let **Secret** be empty.
    7. Select what type of notification you want to post (This sciprt will support all message)
    8. Select Active to Enable notification webhook
* Repository Webhook
    1. Go to **any repository** -> **Settings** -> **Webhooks**
    2. Create New Webook -> Select **Gitea** webhook
    3. Past **Webhook URL** to Target URL
    4. Keep **HTTP Method** as POST
    5. Keep **POST Content Type** as application/json
    6. Let **Secret** be empty.
    7. Select what type of notification you want to post (This sciprt will support all message)
    8. Select Active to Enable notification webhook

# Demo
![rocketchat-gitea-hook](https://raw.githubusercontent.com/Austinsuyoyo/rocketchat-gitea-hook/master/img/push.png)
