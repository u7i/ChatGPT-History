import {TextMessage, ToolCallMessage,ThoughtsMessage, Messages} from "./messages";
import notNull from "../../common/utils/not-null";
import {z} from "zod";

import {
    AuthorizationError,
    BadChatHistoryError,
    ChatNotFoundError,
    ConnectionError,
    UnknownServiceResponseError
} from "./exceptions";

export default class ChatHistoryService {
    async get(chatId: string): Promise<Messages> {
        const token = await this.extractClientToken()
        const state = await this.fetchChatState(chatId, token)
        return this.filterChatHistoryFromState(state)
    }

    private async extractClientToken(): Promise<string> {
        const source = document.getElementsByTagName("body")[0].innerHTML
        const match = source.match(/(?<=")eyJ.*?(?=\\")/)
        return match?.[0] ?? notNull(new AuthorizationError(null))
    }

    private async fetchChatState(id: string, token: string): Promise<ChatState> {
        const result = await fetch(`https://chatgpt.com/backend-api/conversation/${id}`, {
            headers: {'Authorization': `Bearer ${token}`}
        }).catch(_ => { throw new ConnectionError() })

        const response = await result.text()

        if (result.status == 401) throw new AuthorizationError(token)
        if (result.status == 404) throw new ChatNotFoundError(id)
        if (result.status != 200) throw new UnknownServiceResponseError(result.status, response)

        try {
            return ChatStateSchema.parse(JSON.parse(response))
        } catch (e) {
            throw new UnknownServiceResponseError(200, response, e)
        }
    }

    private filterChatHistoryFromState(state: ChatState): Messages {
        const messages: Messages = []

        const root = state.mapping["client-created-root"] ??
            notNull(new BadChatHistoryError(state))

        const children: string[] = [ root.id ]
        const visited: string[] = []

        while (children.length > 0) {
            const id = children.shift()!
            const entry = state.mapping[id]

            if (visited.includes(entry.id)) {
                throw new BadChatHistoryError(state)
            }

            if (entry.message != null) {
                switch (entry.message.type) {
                    case "text":
                        messages.push(new TextMessage(
                            id,
                            entry.message.create_time,
                            entry.message.author.role,
                            entry.message.content.parts,
                            []
                        ))

                        // TODO: (@u7i) Add logic for images
                        // TODO: (@u7i) Note, that attachments may be gathered from multiple sources (like tools)

                        break

                    case "code":
                        messages.push(new ToolCallMessage(
                            id,
                            entry.message.create_time,
                            entry.message.author.role,
                            entry.message.author.name,
                            entry.message.content.text
                        ))

                        break

                    case "thoughts":
                        messages.push(new ThoughtsMessage(
                            id,
                            entry.message.create_time,
                            entry.message.author.role,
                            entry.message.content.thoughts.map(thought => thought.content)
                        ))

                        break

                    default:
                        break;
                }
            }

            visited.push(entry.id)
            children.push(...entry.children)
        }

        return messages
    }
}

type ChatState = z.infer<typeof ChatStateSchema>

// Common fields for messages
const BaseMessage = z.object({
    id: z.string(),
    status: z.enum(["finished_successfully", "in_progress"]),
    create_time: z.number().nullable()
})

// Text messages
const TextAuthorSchema = z.object({
    role: z.enum(["system", "user", "assistant", "tool"])
})

const TextContentSchema = z.object({
    content_type: z.literal("text"),
    parts: z.array(z.string())
})

const TextMessageSchema = BaseMessage.extend({
    type: z.literal("text"),
    author: TextAuthorSchema,
    content: TextContentSchema
})

// Model context schemas
const ModelEditableContextAuthorSchema = z.object({
    role: z.enum(["assistant"])
})

const ModelEditableContextContentSchema = z.object({
    content_type: z.literal("model_editable_context")
})

const ModelEditableContextMessage = BaseMessage.extend({
    type: z.literal("model_editable_context"),
    author: ModelEditableContextAuthorSchema,
    content: ModelEditableContextContentSchema
})

// Tool call schemas
const CodeAuthorSchema = z.object({
    role: z.enum(["assistant", "tool"]),
    name: z.string().nullable()
})

const CodeContentSchema = z.object({
    content_type: z.literal("code"),
    language: z.string().nullable(),
    text: z.string()
})

const CodeMessageSchema = BaseMessage.extend({
    type: z.literal("code"),
    author: CodeAuthorSchema,
    content: CodeContentSchema
})

// Thought schemas
const ThoughtSchema = z.object({
    content: z.string()
})

const ThoughtsAuthorSchema = z.object({
    role: z.enum(["assistant"])
})

const ThoughtsContentSchema = z.object({
    content_type: z.literal("thoughts"),
    thoughts: z.array(ThoughtSchema)
})

const ThoughtsMessageSchema = BaseMessage.extend({
    type: z.literal("thoughts"),
    author: ThoughtsAuthorSchema,
    content: ThoughtsContentSchema
})

// Unknown message (used to avoid failures on parsing of unknown messages types)
const UnknownMessageSchema = z.object({
    type: z.literal("unknown"),
    id: z.string()
})

// Message schemas (with discriminator lifting)
const MessageSchema = z.preprocess(
    (message: any) => {
        if (!message || typeof message !== "object") {
            return message
        }

        if (["code", "text", "thoughts", "model_editable_context"].includes(message.content.content_type)) {
            return { ...message, type: message.content.content_type }
        }

        return { ...message, type: "unknown" }
    },
    z.discriminatedUnion("type", [
        TextMessageSchema, CodeMessageSchema, ModelEditableContextMessage,
        ThoughtsMessageSchema, UnknownMessageSchema
    ])
)

// Chat schemas
const ChatEntrySchema = z.object({
    id: z.string(),
    message: MessageSchema.nullable(),
    children: z.array(z.string())
})

const ChatStateSchema = z.object({
    mapping: z.record(z.string(), ChatEntrySchema)
})
