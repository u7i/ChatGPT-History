import notNull from "../../common/utils/not-null";
import {ElementNotFoundError} from "./exceptions";
import {Milliseconds} from "../../common/utils/time";

export default class ActiveChatPromptService {
    async putAndSend(message: string) {
        this.put(message);
        (await this.awaitForSubmitButton(100)).click();
    }

    put(message: string) {
        this.promptField().innerText = message;
    }

    hasContent(): boolean {
        return this.promptField().innerText.trim().length > 0;
    }

    private async awaitForSubmitButton(maxDelay: Milliseconds): Promise<HTMLButtonElement> {
        const start = Date.now()

        while (Date.now() - start < maxDelay) {
            try { return this.submitButton() } catch {}
            await new Promise(resolve => setTimeout(resolve, 10))
        }

        throw new ElementNotFoundError("submit-button")
    }

    private promptField(): HTMLParagraphElement {
        return document.querySelector("#prompt-textarea > p") ?? notNull(new ElementNotFoundError("prompt"))
    }

    private submitButton(): HTMLButtonElement {
        return document.querySelector("#composer-submit-button") ?? notNull(new ElementNotFoundError("submit-button"))
    }
}