import { BeAnObject, ReturnModelType } from "@typegoose/typegoose/lib/types";
import { Chat } from "./models/chat";
import connectionFactory from "./db";

export class Honeybee {
  Chat!: ReturnModelType<typeof Chat, BeAnObject>;

  constructor(mongoUri: string) {
    const { ChatModel } = connectionFactory(mongoUri);
    this.Chat = ChatModel;
  }

  close() {
    return this.Chat.db.close();
  }
}
