export type MainTabParamList = {
  Chats: undefined;
  ShipLogs: undefined;
  Repos: undefined;
  Vault: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ChatDetail: { chatId: string; chatTitle?: string };
};
