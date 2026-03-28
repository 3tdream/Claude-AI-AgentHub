import { TelegramClient, Api } from "telegram";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

type Args = Record<string, unknown>;
type ToolHandler = (args: Args) => Promise<unknown>;

export const tools: Tool[] = [
  // ===== MESSAGING =====
  {
    name: "send_message",
    description: "Send a message to a user, group, or channel",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Username, phone number, or chat ID",
        },
        message: {
          type: "string",
          description: "Message text to send",
        },
        reply_to: {
          type: "number",
          description: "Message ID to reply to",
        },
        silent: {
          type: "boolean",
          description: "Send without notification",
        },
      },
      required: ["peer", "message"],
    },
  },
  {
    name: "edit_message",
    description: "Edit an existing message",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Username or chat ID",
        },
        message_id: {
          type: "number",
          description: "ID of message to edit",
        },
        text: {
          type: "string",
          description: "New message text",
        },
      },
      required: ["peer", "message_id", "text"],
    },
  },
  {
    name: "delete_messages",
    description: "Delete messages from a chat",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Username or chat ID",
        },
        message_ids: {
          type: "array",
          items: { type: "number" },
          description: "Array of message IDs to delete",
        },
        revoke: {
          type: "boolean",
          description: "Delete for everyone (if possible)",
        },
      },
      required: ["peer", "message_ids"],
    },
  },
  {
    name: "forward_messages",
    description: "Forward messages to another chat",
    inputSchema: {
      type: "object",
      properties: {
        from_peer: {
          type: "string",
          description: "Source chat",
        },
        to_peer: {
          type: "string",
          description: "Destination chat",
        },
        message_ids: {
          type: "array",
          items: { type: "number" },
          description: "Message IDs to forward",
        },
      },
      required: ["from_peer", "to_peer", "message_ids"],
    },
  },

  // ===== MESSAGE HISTORY & SEARCH =====
  {
    name: "get_messages",
    description: "Get messages from a chat by IDs or get recent messages",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Username or chat ID",
        },
        message_ids: {
          type: "array",
          items: { type: "number" },
          description: "Specific message IDs (optional)",
        },
        limit: {
          type: "number",
          description: "Number of recent messages to fetch (default 20)",
        },
      },
      required: ["peer"],
    },
  },
  {
    name: "get_history",
    description: "Get message history from a chat",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Username or chat ID",
        },
        limit: {
          type: "number",
          description: "Number of messages (default 50, max 100)",
        },
        offset_id: {
          type: "number",
          description: "Get messages before this message ID",
        },
        min_id: {
          type: "number",
          description: "Minimum message ID",
        },
        max_id: {
          type: "number",
          description: "Maximum message ID",
        },
      },
      required: ["peer"],
    },
  },
  {
    name: "search_messages",
    description: "Search for messages in a chat or globally",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Chat to search in (omit for global search)",
        },
        query: {
          type: "string",
          description: "Search query",
        },
        limit: {
          type: "number",
          description: "Maximum results (default 20)",
        },
        from_user: {
          type: "string",
          description: "Filter by sender username",
        },
      },
      required: ["query"],
    },
  },

  // ===== DIALOGS & CHATS =====
  {
    name: "get_dialogs",
    description: "Get list of all conversations (chats, groups, channels)",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of dialogs (default 50)",
        },
        archived: {
          type: "boolean",
          description: "Get archived chats",
        },
      },
    },
  },
  {
    name: "get_entity",
    description: "Get information about a user, chat, or channel",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Username, phone, or ID",
        },
      },
      required: ["peer"],
    },
  },
  {
    name: "resolve_username",
    description: "Resolve a username to get user/channel info",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username without @",
        },
      },
      required: ["username"],
    },
  },

  // ===== CONTACTS =====
  {
    name: "get_contacts",
    description: "Get all contacts",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "add_contact",
    description: "Add a contact",
    inputSchema: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Phone number with country code",
        },
        first_name: {
          type: "string",
          description: "First name",
        },
        last_name: {
          type: "string",
          description: "Last name",
        },
      },
      required: ["phone", "first_name"],
    },
  },
  {
    name: "delete_contacts",
    description: "Delete contacts",
    inputSchema: {
      type: "object",
      properties: {
        user_ids: {
          type: "array",
          items: { type: "string" },
          description: "User IDs or usernames to delete",
        },
      },
      required: ["user_ids"],
    },
  },

  // ===== CHANNELS & GROUPS =====
  {
    name: "join_channel",
    description: "Join a public channel or group",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel/group username or invite link",
        },
      },
      required: ["channel"],
    },
  },
  {
    name: "leave_channel",
    description: "Leave a channel or group",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel/group username or ID",
        },
      },
      required: ["channel"],
    },
  },
  {
    name: "get_participants",
    description: "Get members of a group or channel",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Group/channel username or ID",
        },
        limit: {
          type: "number",
          description: "Maximum participants (default 100)",
        },
        filter: {
          type: "string",
          enum: ["all", "admins", "bots", "recent", "kicked", "banned"],
          description: "Filter participants",
        },
      },
      required: ["peer"],
    },
  },
  {
    name: "create_channel",
    description: "Create a new channel or supergroup",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Channel/group title",
        },
        about: {
          type: "string",
          description: "Description",
        },
        megagroup: {
          type: "boolean",
          description: "True for supergroup, false for channel",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "edit_chat",
    description: "Edit chat/channel title or about",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Chat username or ID",
        },
        title: {
          type: "string",
          description: "New title",
        },
        about: {
          type: "string",
          description: "New description",
        },
      },
      required: ["peer"],
    },
  },
  {
    name: "invite_to_channel",
    description: "Invite users to a channel/group",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel/group",
        },
        users: {
          type: "array",
          items: { type: "string" },
          description: "User IDs or usernames to invite",
        },
      },
      required: ["channel", "users"],
    },
  },
  {
    name: "kick_participant",
    description: "Kick a user from a group/channel",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Group/channel",
        },
        user: {
          type: "string",
          description: "User to kick",
        },
      },
      required: ["peer", "user"],
    },
  },

  // ===== MEDIA =====
  {
    name: "send_file",
    description: "Send a file/photo/video (by URL)",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Recipient",
        },
        file: {
          type: "string",
          description: "File URL or path",
        },
        caption: {
          type: "string",
          description: "Caption",
        },
        voice_note: {
          type: "boolean",
          description: "Send as voice note",
        },
        video_note: {
          type: "boolean",
          description: "Send as video note",
        },
      },
      required: ["peer", "file"],
    },
  },

  // ===== USER INFO =====
  {
    name: "get_me",
    description: "Get info about the logged-in user",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_profile",
    description: "Update your profile",
    inputSchema: {
      type: "object",
      properties: {
        first_name: {
          type: "string",
          description: "New first name",
        },
        last_name: {
          type: "string",
          description: "New last name",
        },
        about: {
          type: "string",
          description: "New bio",
        },
      },
    },
  },

  // ===== PINS =====
  {
    name: "pin_message",
    description: "Pin a message in a chat",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Chat",
        },
        message_id: {
          type: "number",
          description: "Message ID to pin",
        },
        silent: {
          type: "boolean",
          description: "Pin without notification",
        },
      },
      required: ["peer", "message_id"],
    },
  },
  {
    name: "unpin_message",
    description: "Unpin a message",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Chat",
        },
        message_id: {
          type: "number",
          description: "Message ID to unpin (omit for all)",
        },
      },
      required: ["peer"],
    },
  },

  // ===== REACTIONS =====
  {
    name: "send_reaction",
    description: "React to a message",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Chat",
        },
        message_id: {
          type: "number",
          description: "Message ID",
        },
        reaction: {
          type: "string",
          description: "Reaction emoji (e.g., '👍', '❤️')",
        },
      },
      required: ["peer", "message_id", "reaction"],
    },
  },

  // ===== READ STATUS =====
  {
    name: "mark_read",
    description: "Mark messages as read",
    inputSchema: {
      type: "object",
      properties: {
        peer: {
          type: "string",
          description: "Chat",
        },
        max_id: {
          type: "number",
          description: "Mark messages up to this ID as read",
        },
      },
      required: ["peer"],
    },
  },
];

export function createToolHandlers(client: TelegramClient): Record<string, ToolHandler> {
  // Helper to resolve peer
  async function resolvePeer(peer: string) {
    return await client.getEntity(peer);
  }

  return {
    // Messaging
    send_message: async (args) => {
      const result = await client.sendMessage(args.peer as string, {
        message: args.message as string,
        replyTo: args.reply_to as number | undefined,
        silent: args.silent as boolean | undefined,
      });
      return {
        id: result.id,
        date: result.date,
        message: (result as any).message,
      };
    },

    edit_message: async (args) => {
      const result = await client.editMessage(args.peer as string, {
        message: args.message_id as number,
        text: args.text as string,
      });
      return { success: true, id: result.id };
    },

    delete_messages: async (args) => {
      const entity = await resolvePeer(args.peer as string);
      const result = await client.deleteMessages(entity, args.message_ids as number[], {
        revoke: args.revoke as boolean | undefined,
      });
      return { deleted: result.length };
    },

    forward_messages: async (args) => {
      const result = await client.forwardMessages(args.to_peer as string, {
        messages: args.message_ids as number[],
        fromPeer: args.from_peer as string,
      });
      return { forwarded: Array.isArray(result) ? result.length : 1 };
    },

    // History & Search
    get_messages: async (args) => {
      const limit = (args.limit as number) || 20;
      const messages = await client.getMessages(args.peer as string, {
        ids: args.message_ids as number[] | undefined,
        limit,
      });
      return messages.map((m) => ({
        id: m.id,
        date: m.date,
        message: m.message,
        fromId: m.fromId?.toString(),
        replyTo: (m.replyTo as any)?.replyToMsgId,
      }));
    },

    get_history: async (args) => {
      const limit = Math.min((args.limit as number) || 50, 100);
      const messages = await client.getMessages(args.peer as string, {
        limit,
        offsetId: args.offset_id as number | undefined,
        minId: args.min_id as number | undefined,
        maxId: args.max_id as number | undefined,
      });
      return messages.map((m) => ({
        id: m.id,
        date: m.date,
        message: m.message,
        fromId: m.fromId?.toString(),
      }));
    },

    search_messages: async (args) => {
      const peer = args.peer as string | undefined;
      const limit = (args.limit as number) || 20;

      const searchParams: any = {
        limit,
        filter: new Api.InputMessagesFilterEmpty(),
      };

      if (args.from_user) {
        searchParams.fromId = await resolvePeer(args.from_user as string);
      }

      let messages;
      if (peer) {
        messages = await client.getMessages(peer, {
          search: args.query as string,
          limit,
        });
      } else {
        const result = await client.invoke(
          new Api.messages.SearchGlobal({
            q: args.query as string,
            filter: new Api.InputMessagesFilterEmpty(),
            minDate: 0,
            maxDate: 0,
            offsetRate: 0,
            offsetPeer: new Api.InputPeerEmpty(),
            offsetId: 0,
            limit,
          })
        );
        messages = (result as any).messages || [];
      }

      return messages.map((m: any) => ({
        id: m.id,
        date: m.date,
        message: m.message,
        peerId: m.peerId?.toString(),
      }));
    },

    // Dialogs
    get_dialogs: async (args) => {
      const limit = (args.limit as number) || 50;
      const dialogs = await client.getDialogs({
        limit,
        archived: args.archived as boolean | undefined,
      });
      return dialogs.map((d) => ({
        id: d.id?.toString(),
        name: d.name || d.title,
        unreadCount: d.unreadCount,
        isUser: d.isUser,
        isGroup: d.isGroup,
        isChannel: d.isChannel,
      }));
    },

    get_entity: async (args) => {
      const entity = await client.getEntity(args.peer as string);
      return {
        id: (entity as any).id?.toString(),
        className: entity.className,
        ...(entity as any),
      };
    },

    resolve_username: async (args) => {
      const result = await client.invoke(
        new Api.contacts.ResolveUsername({
          username: args.username as string,
        })
      );
      return result;
    },

    // Contacts
    get_contacts: async () => {
      const result = await client.invoke(new Api.contacts.GetContacts({ hash: BigInt(0) as any }));
      if (result instanceof Api.contacts.Contacts) {
        return result.users.map((u: any) => ({
          id: u.id?.toString(),
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          phone: u.phone,
        }));
      }
      return [];
    },

    add_contact: async (args) => {
      await client.invoke(
        new Api.contacts.AddContact({
          id: new Api.InputPhoneContact({
            clientId: BigInt(Date.now()) as any,
            phone: args.phone as string,
            firstName: args.first_name as string,
            lastName: (args.last_name as string) || "",
          }) as any,
          firstName: args.first_name as string,
          lastName: (args.last_name as string) || "",
          phone: args.phone as string,
        })
      );
      return { success: true };
    },

    delete_contacts: async (args) => {
      const userIds = args.user_ids as string[];
      for (const userId of userIds) {
        const entity = await resolvePeer(userId);
        await client.invoke(
          new Api.contacts.DeleteContacts({
            id: [entity as any],
          })
        );
      }
      return { deleted: userIds.length };
    },

    // Channels & Groups
    join_channel: async (args) => {
      const channel = args.channel as string;
      if (channel.includes("t.me/") || channel.includes("+")) {
        // Invite link
        const hash = channel.split("/").pop()?.replace("+", "") || channel;
        await client.invoke(new Api.messages.ImportChatInvite({ hash }));
      } else {
        await client.invoke(
          new Api.channels.JoinChannel({
            channel: (await resolvePeer(channel)) as any,
          })
        );
      }
      return { success: true };
    },

    leave_channel: async (args) => {
      const entity = await resolvePeer(args.channel as string);
      await client.invoke(
        new Api.channels.LeaveChannel({
          channel: entity as any,
        })
      );
      return { success: true };
    },

    get_participants: async (args) => {
      const limit = (args.limit as number) || 100;
      const filter = args.filter as string || "all";

      let apiFilter: Api.TypeChannelParticipantsFilter;
      switch (filter) {
        case "admins":
          apiFilter = new Api.ChannelParticipantsAdmins();
          break;
        case "bots":
          apiFilter = new Api.ChannelParticipantsBots();
          break;
        case "recent":
          apiFilter = new Api.ChannelParticipantsRecent();
          break;
        case "kicked":
          apiFilter = new Api.ChannelParticipantsKicked({ q: "" });
          break;
        case "banned":
          apiFilter = new Api.ChannelParticipantsBanned({ q: "" });
          break;
        default:
          apiFilter = new Api.ChannelParticipantsRecent();
      }

      const participants = await client.getParticipants(args.peer as string, {
        limit,
        filter: apiFilter,
      });

      return participants.map((p: any) => ({
        id: p.id?.toString(),
        firstName: p.firstName,
        lastName: p.lastName,
        username: p.username,
      }));
    },

    create_channel: async (args) => {
      const result = await client.invoke(
        new Api.channels.CreateChannel({
          title: args.title as string,
          about: (args.about as string) || "",
          megagroup: args.megagroup as boolean | undefined,
        })
      );
      return result;
    },

    edit_chat: async (args) => {
      const entity = await resolvePeer(args.peer as string);

      if (args.title) {
        await client.invoke(
          new Api.channels.EditTitle({
            channel: entity as any,
            title: args.title as string,
          })
        );
      }

      if (args.about !== undefined) {
        await client.invoke(
          new Api.messages.EditChatAbout({
            peer: entity as any,
            about: args.about as string,
          })
        );
      }

      return { success: true };
    },

    invite_to_channel: async (args) => {
      const channel = await resolvePeer(args.channel as string);
      const users = await Promise.all(
        (args.users as string[]).map((u) => resolvePeer(u))
      );

      await client.invoke(
        new Api.channels.InviteToChannel({
          channel: channel as any,
          users: users as any,
        })
      );

      return { invited: users.length };
    },

    kick_participant: async (args) => {
      const channel = await resolvePeer(args.peer as string);
      const user = await resolvePeer(args.user as string);

      await client.invoke(
        new Api.channels.EditBanned({
          channel: channel as any,
          participant: user as any,
          bannedRights: new Api.ChatBannedRights({
            untilDate: 0,
            viewMessages: true,
          }),
        })
      );

      return { success: true };
    },

    // Media
    send_file: async (args) => {
      const result = await client.sendFile(args.peer as string, {
        file: args.file as string,
        caption: args.caption as string | undefined,
        voiceNote: args.voice_note as boolean | undefined,
        videoNote: args.video_note as boolean | undefined,
      });
      return { id: result.id };
    },

    // User info
    get_me: async () => {
      const me = await client.getMe();
      return {
        id: (me as any).id?.toString(),
        firstName: (me as any).firstName,
        lastName: (me as any).lastName,
        username: (me as any).username,
        phone: (me as any).phone,
      };
    },

    update_profile: async (args) => {
      await client.invoke(
        new Api.account.UpdateProfile({
          firstName: args.first_name as string | undefined,
          lastName: args.last_name as string | undefined,
          about: args.about as string | undefined,
        })
      );
      return { success: true };
    },

    // Pins
    pin_message: async (args) => {
      const entity = await resolvePeer(args.peer as string);
      await client.pinMessage(entity, args.message_id as number, {
        notify: !(args.silent as boolean),
      });
      return { success: true };
    },

    unpin_message: async (args) => {
      const entity = await resolvePeer(args.peer as string);
      if (args.message_id) {
        await client.unpinMessage(entity, args.message_id as number);
      } else {
        await client.unpinMessage(entity);
      }
      return { success: true };
    },

    // Reactions
    send_reaction: async (args) => {
      const entity = await resolvePeer(args.peer as string);
      await client.invoke(
        new Api.messages.SendReaction({
          peer: entity,
          msgId: args.message_id as number,
          reaction: [new Api.ReactionEmoji({ emoticon: args.reaction as string })],
        })
      );
      return { success: true };
    },

    // Read status
    mark_read: async (args) => {
      const entity = await resolvePeer(args.peer as string);
      await client.markAsRead(entity, args.max_id as number | undefined);
      return { success: true };
    },
  };
}
