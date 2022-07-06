# Contribution Guide

## Dev

### Setup

```bash
copy .env.placeholder .env
# edit .env
yarn install

prisma generate
prisma db push
# when it reaches a stable state
prisma migrate dev --name initial-state
```

### Debug Bot

```bash
yarn dev
```

## References

### Discord

- [Discord Developer Portal — Documentation — Permissions](https://discord.com/developers/docs/topics/permissions)
- [Discord Moderator Academy](https://discord.com/moderation/1500000176222-201:-Permissions-on-Discord)
- [Permissions | discord.js Guide](https://discordjs.guide/popular-topics/permissions.html#roles-as-bot-permissions)
