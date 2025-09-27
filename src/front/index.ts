import ChatHistoryService from "./gpt/chat-history-service";

function urlChange(): Promise<void> {
    return new Promise(resolve => {
        const href = document.location.href;

        const observer = new MutationObserver(() => {
            if (href !== document.location.href) {
                resolve()
            }
        });

        observer.observe(document.querySelector("body")!, { childList: true, subtree: true });
    })
}

async function testHistoryService() {
    const service = new ChatHistoryService()

    while (true) {
        const chatId = document.location.href.match(/(?<=\/)[^\/]*$/)![0]

        console.log(`Getting history for chat '${chatId}'...`)
        console.log(await service.get(chatId))

        await urlChange()
    }
}

testHistoryService()
