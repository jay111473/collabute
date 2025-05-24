/**
 * This file contains configuration for TalkJS chat integration
 */

export const talkJsConfig = {
  appId: process.env.NEXT_PUBLIC_TALKJS_APP_ID || "",
};

export const isTalkJsConfigured = !!talkJsConfig.appId; 