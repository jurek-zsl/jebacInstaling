async function getChildId(tabId) {
    const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
            const urlParams = new URLSearchParams(window.location.search);
            if(urlParams.has('child_id')) return urlParams.get('child_id');
            return window.child_id || null;
        }
    });
    return result[0].result;
}

async function getNextWordId(child_id) {
    const response = await fetch("https://instaling.pl/ling2/server/actions/generate_next_word.php", {
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
        },
        method: "POST",
        body: `child_id=${child_id}&date=${Date.now()}`
    });
    const data = await response.json();
    return data.id;
}

async function getWordFromId(id) {
    const res = await fetch(`https://instaling.pl/ling2/server/actions/getAudioUrl.php?id=${id}`, {
        credentials: "include"
    });
    const data = await res.json();
    const urlParts = data.url.split('/');
    return decodeURIComponent(urlParts[urlParts.length - 1].replace('.mp3',''));
}

async function fillAnswer(word, tabId) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (word) => {
            const input = document.getElementById("answer");
            if(input) input.value = word;
        },
        args: [word]
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
        const childId = await getChildId(tab.id);
        if(!childId) throw new Error("child_id not found on page.");

        const id = await getNextWordId(childId);
        const word = await getWordFromId(id);

        document.getElementById("word").textContent = word;

        document.getElementById("fillBtn").onclick = () => fillAnswer(word, tab.id);
    } catch (e) {
        console.error(e);
        document.getElementById("word").textContent = "Error fetching word";
    }
});
