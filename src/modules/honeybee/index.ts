import { BeAnObject, ReturnModelType } from "@typegoose/typegoose/lib/types";
import { Chat } from "./chat";
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
