import { Api } from "grammy";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

type ToolHandler = (api: Api, args: Record<string, unknown>) => Promise<unknown>;

export const tools: Tool[] = [
  // ===== MESSAGE TOOLS =====
  {
    name: "send_message",
    description: "Send a text message to a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Unique identifier for the target chat or username (@channelusername)",
        },
        text: {
          type: "string",
          description: "Text of the message to be sent",
        },
        parse_mode: {
          type: "string",
          enum: ["HTML", "Markdown", "MarkdownV2"],
          description: "Mode for parsing entities in the message text",
        },
        disable_notification: {
          type: "boolean",
          description: "Sends the message silently",
        },
        reply_to_message_id: {
          type: "number",
          description: "If the message is a reply, ID of the original message",
        },
      },
      required: ["chat_id", "text"],
    },
  },
  {
    name: "edit_message",
    description: "Edit a text message",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Unique identifier for the target chat",
        },
        message_id: {
          type: "number",
          description: "Identifier of the message to edit",
        },
        text: {
          type: "string",
          description: "New text of the message",
        },
        parse_mode: {
          type: "string",
          enum: ["HTML", "Markdown", "MarkdownV2"],
          description: "Mode for parsing entities",
        },
      },
      required: ["chat_id", "message_id", "text"],
    },
  },
  {
    name: "delete_message",
    description: "Delete a message",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Unique identifier for the target chat",
        },
        message_id: {
          type: "number",
          description: "Identifier of the message to delete",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
  {
    name: "forward_message",
    description: "Forward a message from one chat to another",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat to forward to",
        },
        from_chat_id: {
          type: ["string", "number"],
          description: "Chat where the original message was sent",
        },
        message_id: {
          type: "number",
          description: "Message identifier in the chat specified in from_chat_id",
        },
        disable_notification: {
          type: "boolean",
          description: "Sends the message silently",
        },
      },
      required: ["chat_id", "from_chat_id", "message_id"],
    },
  },
  {
    name: "copy_message",
    description: "Copy a message without the 'Forwarded from' tag",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        from_chat_id: {
          type: ["string", "number"],
          description: "Source chat",
        },
        message_id: {
          type: "number",
          description: "Message identifier",
        },
      },
      required: ["chat_id", "from_chat_id", "message_id"],
    },
  },

  // ===== MEDIA TOOLS =====
  {
    name: "send_photo",
    description: "Send a photo to a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        photo: {
          type: "string",
          description: "Photo URL or file_id",
        },
        caption: {
          type: "string",
          description: "Photo caption",
        },
        parse_mode: {
          type: "string",
          enum: ["HTML", "Markdown", "MarkdownV2"],
        },
      },
      required: ["chat_id", "photo"],
    },
  },
  {
    name: "send_document",
    description: "Send a document/file to a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        document: {
          type: "string",
          description: "Document URL or file_id",
        },
        caption: {
          type: "string",
          description: "Document caption",
        },
      },
      required: ["chat_id", "document"],
    },
  },
  {
    name: "send_video",
    description: "Send a video to a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        video: {
          type: "string",
          description: "Video URL or file_id",
        },
        caption: {
          type: "string",
          description: "Video caption",
        },
      },
      required: ["chat_id", "video"],
    },
  },
  {
    name: "send_audio",
    description: "Send an audio file to a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        audio: {
          type: "string",
          description: "Audio URL or file_id",
        },
        caption: {
          type: "string",
          description: "Audio caption",
        },
      },
      required: ["chat_id", "audio"],
    },
  },
  {
    name: "send_voice",
    description: "Send a voice message",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        voice: {
          type: "string",
          description: "Voice message URL or file_id (OGG format with OPUS)",
        },
        caption: {
          type: "string",
        },
      },
      required: ["chat_id", "voice"],
    },
  },
  {
    name: "send_location",
    description: "Send a location point on the map",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        latitude: {
          type: "number",
          description: "Latitude of the location",
        },
        longitude: {
          type: "number",
          description: "Longitude of the location",
        },
      },
      required: ["chat_id", "latitude", "longitude"],
    },
  },
  {
    name: "send_contact",
    description: "Send a phone contact",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        phone_number: {
          type: "string",
          description: "Contact's phone number",
        },
        first_name: {
          type: "string",
          description: "Contact's first name",
        },
        last_name: {
          type: "string",
          description: "Contact's last name",
        },
      },
      required: ["chat_id", "phone_number", "first_name"],
    },
  },

  // ===== CHAT INFO TOOLS =====
  {
    name: "get_chat",
    description: "Get information about a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "get_chat_member",
    description: "Get information about a member of a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        user_id: {
          type: "number",
          description: "Unique identifier of the target user",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "get_chat_member_count",
    description: "Get the number of members in a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "get_chat_administrators",
    description: "Get a list of administrators in a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
      },
      required: ["chat_id"],
    },
  },

  // ===== CHAT MANAGEMENT TOOLS =====
  {
    name: "set_chat_title",
    description: "Change the title of a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        title: {
          type: "string",
          description: "New chat title (1-128 characters)",
        },
      },
      required: ["chat_id", "title"],
    },
  },
  {
    name: "set_chat_description",
    description: "Change the description of a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        description: {
          type: "string",
          description: "New chat description (0-255 characters)",
        },
      },
      required: ["chat_id", "description"],
    },
  },
  {
    name: "pin_chat_message",
    description: "Pin a message in a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        message_id: {
          type: "number",
          description: "Identifier of the message to pin",
        },
        disable_notification: {
          type: "boolean",
          description: "Pin silently",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
  {
    name: "unpin_chat_message",
    description: "Unpin a message in a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        message_id: {
          type: "number",
          description: "Identifier of the message to unpin",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "leave_chat",
    description: "Leave a group, supergroup, or channel",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
      },
      required: ["chat_id"],
    },
  },

  // ===== MEMBER MANAGEMENT TOOLS =====
  {
    name: "ban_chat_member",
    description: "Ban a user from a group/supergroup/channel",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        user_id: {
          type: "number",
          description: "User to ban",
        },
        until_date: {
          type: "number",
          description: "Unix timestamp when ban will be lifted (0 or absent = forever)",
        },
        revoke_messages: {
          type: "boolean",
          description: "Delete all messages from the user",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "unban_chat_member",
    description: "Unban a user from a group/supergroup/channel",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        user_id: {
          type: "number",
          description: "User to unban",
        },
        only_if_banned: {
          type: "boolean",
          description: "Only unban if currently banned",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "restrict_chat_member",
    description: "Restrict a user in a supergroup",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        user_id: {
          type: "number",
          description: "User to restrict",
        },
        can_send_messages: {
          type: "boolean",
          description: "Allow sending text messages",
        },
        can_send_media_messages: {
          type: "boolean",
          description: "Allow sending media",
        },
        can_send_polls: {
          type: "boolean",
          description: "Allow sending polls",
        },
        can_send_other_messages: {
          type: "boolean",
          description: "Allow sending stickers, GIFs, etc.",
        },
        can_add_web_page_previews: {
          type: "boolean",
          description: "Allow adding web page previews",
        },
        until_date: {
          type: "number",
          description: "Unix timestamp when restrictions will be lifted",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "promote_chat_member",
    description: "Promote or demote a user in a supergroup/channel",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        user_id: {
          type: "number",
          description: "User to promote",
        },
        can_manage_chat: {
          type: "boolean",
          description: "Manage chat",
        },
        can_delete_messages: {
          type: "boolean",
          description: "Delete messages",
        },
        can_manage_video_chats: {
          type: "boolean",
          description: "Manage video chats",
        },
        can_restrict_members: {
          type: "boolean",
          description: "Restrict members",
        },
        can_promote_members: {
          type: "boolean",
          description: "Promote other admins",
        },
        can_change_info: {
          type: "boolean",
          description: "Change chat info",
        },
        can_invite_users: {
          type: "boolean",
          description: "Invite users",
        },
        can_post_messages: {
          type: "boolean",
          description: "Post in channels",
        },
        can_edit_messages: {
          type: "boolean",
          description: "Edit messages in channels",
        },
        can_pin_messages: {
          type: "boolean",
          description: "Pin messages",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },

  // ===== BOT MANAGEMENT TOOLS =====
  {
    name: "get_me",
    description: "Get basic information about the bot",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "set_my_commands",
    description: "Set the list of bot commands",
    inputSchema: {
      type: "object",
      properties: {
        commands: {
          type: "array",
          items: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "Command text (1-32 chars, no slash)",
              },
              description: {
                type: "string",
                description: "Command description (1-256 chars)",
              },
            },
            required: ["command", "description"],
          },
          description: "List of bot commands",
        },
        scope: {
          type: "object",
          description: "Scope of commands (default, all_private_chats, etc.)",
        },
      },
      required: ["commands"],
    },
  },
  {
    name: "get_my_commands",
    description: "Get the current list of bot commands",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "object",
          description: "Scope for which to get commands",
        },
      },
    },
  },
  {
    name: "delete_my_commands",
    description: "Delete bot commands for a given scope",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "object",
          description: "Scope for which to delete commands",
        },
      },
    },
  },
  {
    name: "set_my_name",
    description: "Change the bot's name",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "New bot name (0-64 characters)",
        },
        language_code: {
          type: "string",
          description: "Two-letter ISO 639-1 language code",
        },
      },
    },
  },
  {
    name: "set_my_description",
    description: "Change the bot's description shown in empty chat",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "New bot description (0-512 characters)",
        },
        language_code: {
          type: "string",
          description: "Two-letter ISO 639-1 language code",
        },
      },
    },
  },
  {
    name: "set_my_short_description",
    description: "Change the bot's short description for sharing",
    inputSchema: {
      type: "object",
      properties: {
        short_description: {
          type: "string",
          description: "New short description (0-120 characters)",
        },
        language_code: {
          type: "string",
          description: "Two-letter ISO 639-1 language code",
        },
      },
    },
  },

  // ===== INLINE KEYBOARD & CALLBACKS =====
  {
    name: "send_message_with_keyboard",
    description: "Send a message with an inline keyboard",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        text: {
          type: "string",
          description: "Message text",
        },
        inline_keyboard: {
          type: "array",
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string", description: "Button text" },
                callback_data: { type: "string", description: "Callback data" },
                url: { type: "string", description: "URL to open" },
              },
              required: ["text"],
            },
          },
          description: "Array of button rows",
        },
        parse_mode: {
          type: "string",
          enum: ["HTML", "Markdown", "MarkdownV2"],
        },
      },
      required: ["chat_id", "text", "inline_keyboard"],
    },
  },
  {
    name: "answer_callback_query",
    description: "Send answers to callback queries from inline keyboards",
    inputSchema: {
      type: "object",
      properties: {
        callback_query_id: {
          type: "string",
          description: "Unique identifier for the query",
        },
        text: {
          type: "string",
          description: "Text of the notification (0-200 characters)",
        },
        show_alert: {
          type: "boolean",
          description: "Show as alert instead of notification",
        },
        url: {
          type: "string",
          description: "URL to open",
        },
      },
      required: ["callback_query_id"],
    },
  },

  // ===== POLLS =====
  {
    name: "send_poll",
    description: "Send a native poll",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        question: {
          type: "string",
          description: "Poll question (1-300 characters)",
        },
        options: {
          type: "array",
          items: { type: "string" },
          description: "Answer options (2-10 strings, 1-100 chars each)",
        },
        is_anonymous: {
          type: "boolean",
          description: "True for anonymous poll",
        },
        type: {
          type: "string",
          enum: ["regular", "quiz"],
          description: "Poll type",
        },
        allows_multiple_answers: {
          type: "boolean",
          description: "Allow multiple answers",
        },
        correct_option_id: {
          type: "number",
          description: "0-based index of correct answer for quiz",
        },
        explanation: {
          type: "string",
          description: "Explanation shown after answering quiz",
        },
      },
      required: ["chat_id", "question", "options"],
    },
  },
  {
    name: "stop_poll",
    description: "Stop a poll",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        message_id: {
          type: "number",
          description: "Identifier of the poll message",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },

  // ===== STICKERS =====
  {
    name: "send_sticker",
    description: "Send a sticker",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        sticker: {
          type: "string",
          description: "Sticker file_id or URL",
        },
      },
      required: ["chat_id", "sticker"],
    },
  },
  {
    name: "get_sticker_set",
    description: "Get a sticker set",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the sticker set",
        },
      },
      required: ["name"],
    },
  },

  // ===== CHAT INVITE LINKS =====
  {
    name: "export_chat_invite_link",
    description: "Generate a new primary invite link for a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "create_chat_invite_link",
    description: "Create an additional invite link for a chat",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        name: {
          type: "string",
          description: "Invite link name (0-32 characters)",
        },
        expire_date: {
          type: "number",
          description: "Unix timestamp when link will expire",
        },
        member_limit: {
          type: "number",
          description: "Maximum number of users (1-99999)",
        },
        creates_join_request: {
          type: "boolean",
          description: "True if users must be approved to join",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "revoke_chat_invite_link",
    description: "Revoke an invite link",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "number"],
          description: "Target chat",
        },
        invite_link: {
          type: "string",
          description: "The invite link to revoke",
        },
      },
      required: ["chat_id", "invite_link"],
    },
  },

  // ===== FILE OPERATIONS =====
  {
    name: "get_file",
    description: "Get basic info about a file and prepare it for downloading",
    inputSchema: {
      type: "object",
      properties: {
        file_id: {
          type: "string",
          description: "File identifier",
        },
      },
      required: ["file_id"],
    },
  },
];

export const toolHandlers: Record<string, ToolHandler> = {
  // Message handlers
  send_message: async (api, args) => {
    return api.sendMessage(
      args.chat_id as string | number,
      args.text as string,
      {
        parse_mode: args.parse_mode as "HTML" | "Markdown" | "MarkdownV2" | undefined,
        disable_notification: args.disable_notification as boolean | undefined,
        reply_parameters: args.reply_to_message_id
          ? { message_id: args.reply_to_message_id as number }
          : undefined,
      }
    );
  },

  edit_message: async (api, args) => {
    return api.editMessageText(
      args.chat_id as string | number,
      args.message_id as number,
      args.text as string,
      {
        parse_mode: args.parse_mode as "HTML" | "Markdown" | "MarkdownV2" | undefined,
      }
    );
  },

  delete_message: async (api, args) => {
    return api.deleteMessage(
      args.chat_id as string | number,
      args.message_id as number
    );
  },

  forward_message: async (api, args) => {
    return api.forwardMessage(
      args.chat_id as string | number,
      args.from_chat_id as string | number,
      args.message_id as number,
      {
        disable_notification: args.disable_notification as boolean | undefined,
      }
    );
  },

  copy_message: async (api, args) => {
    return api.copyMessage(
      args.chat_id as string | number,
      args.from_chat_id as string | number,
      args.message_id as number
    );
  },

  // Media handlers
  send_photo: async (api, args) => {
    return api.sendPhoto(
      args.chat_id as string | number,
      args.photo as string,
      {
        caption: args.caption as string | undefined,
        parse_mode: args.parse_mode as "HTML" | "Markdown" | "MarkdownV2" | undefined,
      }
    );
  },

  send_document: async (api, args) => {
    return api.sendDocument(
      args.chat_id as string | number,
      args.document as string,
      {
        caption: args.caption as string | undefined,
      }
    );
  },

  send_video: async (api, args) => {
    return api.sendVideo(
      args.chat_id as string | number,
      args.video as string,
      {
        caption: args.caption as string | undefined,
      }
    );
  },

  send_audio: async (api, args) => {
    return api.sendAudio(
      args.chat_id as string | number,
      args.audio as string,
      {
        caption: args.caption as string | undefined,
      }
    );
  },

  send_voice: async (api, args) => {
    return api.sendVoice(
      args.chat_id as string | number,
      args.voice as string,
      {
        caption: args.caption as string | undefined,
      }
    );
  },

  send_location: async (api, args) => {
    return api.sendLocation(
      args.chat_id as string | number,
      args.latitude as number,
      args.longitude as number
    );
  },

  send_contact: async (api, args) => {
    return api.sendContact(
      args.chat_id as string | number,
      args.phone_number as string,
      args.first_name as string,
      {
        last_name: args.last_name as string | undefined,
      }
    );
  },

  // Chat info handlers
  get_chat: async (api, args) => {
    return api.getChat(args.chat_id as string | number);
  },

  get_chat_member: async (api, args) => {
    return api.getChatMember(
      args.chat_id as string | number,
      args.user_id as number
    );
  },

  get_chat_member_count: async (api, args) => {
    return api.getChatMemberCount(args.chat_id as string | number);
  },

  get_chat_administrators: async (api, args) => {
    return api.getChatAdministrators(args.chat_id as string | number);
  },

  // Chat management handlers
  set_chat_title: async (api, args) => {
    return api.setChatTitle(
      args.chat_id as string | number,
      args.title as string
    );
  },

  set_chat_description: async (api, args) => {
    return api.setChatDescription(
      args.chat_id as string | number,
      args.description as string
    );
  },

  pin_chat_message: async (api, args) => {
    return api.pinChatMessage(
      args.chat_id as string | number,
      args.message_id as number,
      {
        disable_notification: args.disable_notification as boolean | undefined,
      }
    );
  },

  unpin_chat_message: async (api, args) => {
    return api.unpinChatMessage(
      args.chat_id as string | number,
      args.message_id as number | undefined
    );
  },

  leave_chat: async (api, args) => {
    return api.leaveChat(args.chat_id as string | number);
  },

  // Member management handlers
  ban_chat_member: async (api, args) => {
    return api.banChatMember(
      args.chat_id as string | number,
      args.user_id as number,
      {
        until_date: args.until_date as number | undefined,
        revoke_messages: args.revoke_messages as boolean | undefined,
      }
    );
  },

  unban_chat_member: async (api, args) => {
    return api.unbanChatMember(
      args.chat_id as string | number,
      args.user_id as number,
      {
        only_if_banned: args.only_if_banned as boolean | undefined,
      }
    );
  },

  restrict_chat_member: async (api, args) => {
    return api.restrictChatMember(
      args.chat_id as string | number,
      args.user_id as number,
      {
        can_send_messages: args.can_send_messages as boolean | undefined,
        can_send_audios: args.can_send_media_messages as boolean | undefined,
        can_send_documents: args.can_send_media_messages as boolean | undefined,
        can_send_photos: args.can_send_media_messages as boolean | undefined,
        can_send_videos: args.can_send_media_messages as boolean | undefined,
        can_send_video_notes: args.can_send_media_messages as boolean | undefined,
        can_send_voice_notes: args.can_send_media_messages as boolean | undefined,
        can_send_polls: args.can_send_polls as boolean | undefined,
        can_send_other_messages: args.can_send_other_messages as boolean | undefined,
        can_add_web_page_previews: args.can_add_web_page_previews as boolean | undefined,
      },
      {
        until_date: args.until_date as number | undefined,
      }
    );
  },

  promote_chat_member: async (api, args) => {
    return api.promoteChatMember(
      args.chat_id as string | number,
      args.user_id as number,
      {
        can_manage_chat: args.can_manage_chat as boolean | undefined,
        can_delete_messages: args.can_delete_messages as boolean | undefined,
        can_manage_video_chats: args.can_manage_video_chats as boolean | undefined,
        can_restrict_members: args.can_restrict_members as boolean | undefined,
        can_promote_members: args.can_promote_members as boolean | undefined,
        can_change_info: args.can_change_info as boolean | undefined,
        can_invite_users: args.can_invite_users as boolean | undefined,
        can_post_messages: args.can_post_messages as boolean | undefined,
        can_edit_messages: args.can_edit_messages as boolean | undefined,
        can_pin_messages: args.can_pin_messages as boolean | undefined,
      }
    );
  },

  // Bot management handlers
  get_me: async (api) => {
    return api.getMe();
  },

  set_my_commands: async (api, args) => {
    const commands = (args.commands as Array<{ command: string; description: string }>).map(
      (cmd) => ({
        command: cmd.command,
        description: cmd.description,
      })
    );
    return api.setMyCommands(commands, args.scope as any);
  },

  get_my_commands: async (api, args) => {
    return api.getMyCommands(args.scope as any);
  },

  delete_my_commands: async (api, args) => {
    return api.deleteMyCommands(args.scope as any);
  },

  set_my_name: async (api, args) => {
    return api.raw.setMyName({
      name: args.name as string | undefined,
      language_code: args.language_code as any,
    });
  },

  set_my_description: async (api, args) => {
    return api.raw.setMyDescription({
      description: args.description as string | undefined,
      language_code: args.language_code as any,
    });
  },

  set_my_short_description: async (api, args) => {
    return api.raw.setMyShortDescription({
      short_description: args.short_description as string | undefined,
      language_code: args.language_code as any,
    });
  },

  // Inline keyboard handlers
  send_message_with_keyboard: async (api, args) => {
    const rawKeyboard = args.inline_keyboard as Array<Array<{ text: string; callback_data?: string; url?: string }>>;
    const keyboard = rawKeyboard.map((row) =>
      row.map((btn) => {
        if (btn.url) return { text: btn.text, url: btn.url };
        return { text: btn.text, callback_data: btn.callback_data || btn.text };
      })
    );
    return api.sendMessage(
      args.chat_id as string | number,
      args.text as string,
      {
        parse_mode: args.parse_mode as "HTML" | "Markdown" | "MarkdownV2" | undefined,
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  },

  answer_callback_query: async (api, args) => {
    return api.answerCallbackQuery(args.callback_query_id as string, {
      text: args.text as string | undefined,
      show_alert: args.show_alert as boolean | undefined,
      url: args.url as string | undefined,
    });
  },

  // Poll handlers
  send_poll: async (api, args) => {
    const options = (args.options as string[]).map((option) => ({ text: option }));
    return api.sendPoll(
      args.chat_id as string | number,
      args.question as string,
      options,
      {
        is_anonymous: args.is_anonymous as boolean | undefined,
        type: args.type as "regular" | "quiz" | undefined,
        allows_multiple_answers: args.allows_multiple_answers as boolean | undefined,
        correct_option_id: args.correct_option_id as number | undefined,
        explanation: args.explanation as string | undefined,
      }
    );
  },

  stop_poll: async (api, args) => {
    return api.stopPoll(
      args.chat_id as string | number,
      args.message_id as number
    );
  },

  // Sticker handlers
  send_sticker: async (api, args) => {
    return api.sendSticker(
      args.chat_id as string | number,
      args.sticker as string
    );
  },

  get_sticker_set: async (api, args) => {
    return api.getStickerSet(args.name as string);
  },

  // Invite link handlers
  export_chat_invite_link: async (api, args) => {
    return api.exportChatInviteLink(args.chat_id as string | number);
  },

  create_chat_invite_link: async (api, args) => {
    return api.createChatInviteLink(args.chat_id as string | number, {
      name: args.name as string | undefined,
      expire_date: args.expire_date as number | undefined,
      member_limit: args.member_limit as number | undefined,
      creates_join_request: args.creates_join_request as boolean | undefined,
    });
  },

  revoke_chat_invite_link: async (api, args) => {
    return api.revokeChatInviteLink(
      args.chat_id as string | number,
      args.invite_link as string
    );
  },

  // File handler
  get_file: async (api, args) => {
    return api.getFile(args.file_id as string);
  },
};
