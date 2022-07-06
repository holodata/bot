-- CreateTable
CREATE TABLE "Mapping" (
    "guildId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    PRIMARY KEY ("guildId", "targetId", "emoji")
);
