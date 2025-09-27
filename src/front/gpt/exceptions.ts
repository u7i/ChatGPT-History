class ConnectionError extends Error {
    constructor() {
        super('Could not connect to ChatGPT API');
    }
}

class UnknownServiceResponseError extends Error {
    readonly body: string

    constructor(status: number, body: string, cause?: unknown) {
        super(`ChatGPT API returned unknown response '${status}'`, {cause});
        this.body = body;
    }
}

class ChatNotFoundError extends Error {
    readonly id: string

    constructor(id: string) {
        super(`Chat '${id}' was not found`);
        this.id = id
    }
}

class AuthorizationError extends Error {
    readonly token: string | null

    constructor(token: string | null) {
        super('Client has no access to ChatGPT API');
        this.token = token;
    }
}

class BadChatHistoryError extends Error {
    readonly history: object

    constructor(history: object) {
        super('Chat history is corrupted');
        this.history = history;
    }
}

export {
    ConnectionError,
    ChatNotFoundError,
    AuthorizationError,
    BadChatHistoryError,
    UnknownServiceResponseError,
}

