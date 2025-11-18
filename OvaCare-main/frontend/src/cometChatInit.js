// src/cometChatInit.js
import { CometChat } from "@cometchat-pro/chat";
import { COMETCHAT_CONSTANTS } from "./cometChatConfig";

export const initializeCometChat = async () => {
  const appID = COMETCHAT_CONSTANTS.APP_ID;
  const region = COMETCHAT_CONSTANTS.REGION;

  const appSetting = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(region)
    .build();

  return CometChat.init(appID, appSetting);
};
