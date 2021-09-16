const whatsAppClient = require("@green-api/whatsapp-api-client");
const express = require("express");

const app = express();
app.use(express.json());

(async () => {
  try {
    const restAPI = whatsAppClient.restAPI({
      idInstance: "15689",
      apiTokenInstance: "4d9d50de166b977161f7810987288cbb0b78a8c54b95e1bafe",
    });

    // Set http url, where webhooks are hosted.
    // Url must have public domain address.
    await restAPI.settings.setSettings({
      webhookUrl:
        "https://7272-2a02-ce0-2000-7c3a-e1fa-a084-645e-ca49.ngrok.io/webhooks",
    });

    const webHookAPI = whatsAppClient.webhookAPI(app, "/webhooks");

    var pendingReservation = [];

    // Subscribe to webhook happened when WhatsApp delivered a message
    webHookAPI.onIncomingMessageText(
      async (data, idInstance, idMessage, sender, typeMessage, textMessage) => {
        const { chatId } = data.senderData;
        let isPending = false;

        pendingReservation.forEach((res) => {
          if (res.chatId.length > 0 && res.chatId === chatId) {
            isPending = true;
          }
        });
        if (isPending) {
          for (let i = 0; i < pendingReservation.length; i++) {
            if (pendingReservation[i].chatId === chatId) {
              if (!pendingReservation[i].lang) {
                if (textMessage === "1" || textMessage === "2") {
                  pendingReservation[i].lang = textMessage;
                  const text = textMessage === "1" ? `اسمك؟` : `Your name?`;

                  await restAPI.message.sendMessage(chatId, null, text);

                  pendingReservation[i].nameQSend = true;
                  break;
                } else {
                  const text = `مرحبا بك
                                      welcome
                                      ‎1- العربية
                                      2- English`;
                  await restAPI.message.sendMessage(chatId, null, text);
                }
              } else if (pendingReservation[i].lang === "1") {
                if (
                  pendingReservation[i].nameQSend &&
                  !pendingReservation[i].phoneQSend
                ) {
                  pendingReservation[i].name = textMessage;
                  const text = `رقم جوالك؟`;
                  await restAPI.message.sendMessage(chatId, null, text);
                  pendingReservation[i].phoneQSend = true;
                  break;
                } else if (
                  pendingReservation[i].nameQSend &&
                  pendingReservation[i].phoneQSend &&
                  !pendingReservation[i].questQSend
                ) {
                  pendingReservation[i].phone = textMessage;
                  const text = `عدد الاشخاص؟`;
                  await restAPI.message.sendMessage(chatId, null, text);
                  pendingReservation[i].questQSend = true;
                  break;
                } else if (
                  pendingReservation[i].nameQSend &&
                  pendingReservation[i].phoneQSend &&
                  pendingReservation[i].questQSend &&
                  !pendingReservation[i].thankSend
                ) {
                  pendingReservation[i].quests = textMessage;
                  const text = `تم الحجز بنجاح\n\nالاسم:${pendingReservation[i].name}\nالرقم:${pendingReservation[i].phone}\nعدد الاشخاص:${pendingReservation[i].quests}\n\nشكرا لكم\nفخورين لمساعدتك\nRemmsh\nwww.remmsh.com`;
                  await restAPI.message.sendMessage(chatId, null, text);
                  pendingReservation[i].thankSend = true;
                  const index = pendingReservation.indexOf(i);
                  pendingReservation.splice(index, 1);
                  break;
                }
              } else if (pendingReservation[i].lang === "2") {
                if (
                  pendingReservation[i].nameQSend &&
                  !pendingReservation[i].phoneQSend
                ) {
                  pendingReservation[i].name = textMessage;
                  const text = `Your phone number?`;
                  await restAPI.message.sendMessage(chatId, null, text);
                  pendingReservation[i].phoneQSend = true;
                  break;
                } else if (
                  pendingReservation[i].nameQSend &&
                  pendingReservation[i].phoneQSend &&
                  !pendingReservation[i].questQSend
                ) {
                  pendingReservation[i].phone = textMessage;
                  const text = `Number of guest?`;
                  await restAPI.message.sendMessage(chatId, null, text);
                  pendingReservation[i].questQSend = true;
                  break;
                } else if (
                  pendingReservation[i].nameQSend &&
                  pendingReservation[i].phoneQSend &&
                  pendingReservation[i].questQSend &&
                  !pendingReservation[i].thankSend
                ) {
                  pendingReservation[i].quests = textMessage;
                  const text = `Your reservation is confirmed\n\nName:${pendingReservation[i].name}\nPhone:${pendingReservation[i].phone}\nNumber of guest:${pendingReservation[i].quests}\n\nHappy to assist you,\nRemmsh\nwww.remmsh.com`;
                  await restAPI.message.sendMessage(chatId, null, text);
                  pendingReservation[i].thankSend = true;
                  const index = pendingReservation.indexOf(i);
                  pendingReservation.splice(index, 1);
                  break;
                }
              }
            }
          }
        } else {
          const text = `مرحبا بك
                welcome
                ‎1- العربية
                2- English`;
          await restAPI.message.sendMessage(chatId, null, text);
          pendingReservation.push({ chatId: chatId });
        }
      }
    );

    // Run web server with public domain address
    app.listen(3000, async () => {
      console.log(`Started. App listening on port 3000!`);
    });
  } catch (error) {
    console.error(error);
  }
})();
