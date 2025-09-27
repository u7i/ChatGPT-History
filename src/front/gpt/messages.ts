class TextMessage {
    constructor(
        public id: string,
        public created_at: number | null,
        public author: "system" | "user" | "assistant" | "tool",
        public content: string[],
        public attachments: Blob[]
    ) {}
}

class ToolCallMessage {
    constructor(
        public id: string,
        public created_at: number | null,
        public author: "assistant" | "tool",
        public name: string | null,
        public text: string
    ) {}
}

class ThoughtsMessage {
    constructor(
        public id: string,
        public created_at: number | null,
        public author: "assistant",
        public thoughts: string[]
    ) {}
}

type Messages = (TextMessage | ToolCallMessage | ThoughtsMessage)[]

export { TextMessage, ToolCallMessage, ThoughtsMessage, Messages }
