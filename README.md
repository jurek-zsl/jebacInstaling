# 🖕jebacInstaling

Chrome and Firefox extension for auto completing instaling.pl questions

## ✨Features

- Automatically fetches and displays the correct answer for instaling.pl questions.
- Auto-pastes answers into the answer field when found.
- UI window with status, progress, last answer, and refetch/fill buttons.
- Manual refetch and fill options to recover from bugs or missing answers.
- Option to enable/disable auto pasting.

## ⚙️How it Works

1. The extension queries the currently active tab for the `child_id` parameter.
2. It fetches the list of words assigned for current user from instaling.pl.
3. It shows current polish word with translation and auto completes it into the text box.

> [!WARNING]
> [instaling.pl](https://instaling.pl) has been made that we're not able to fetch all words. Because of that 3%±2 of words are not available in each word list.

## 📥Installation

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/jebacinstaling/bffkngclimjbnbklboobnfifmdmiopli) [![Firefox Add-ons](https://img.shields.io/badge/Firefox%20Add--ons-Install-orange?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/jebacinstaling/)
<br>
![Chrome Web Store Last Updated](https://img.shields.io/chrome-web-store/last-updated/bffkngclimjbnbklboobnfifmdmiopli) ![Firefox Last Updated](https://img.shields.io/badge/dynamic/regex?label=last%20updated&url=https%3A%2F%2Faddons.mozilla.org%2Fen-US%2Ffirefox%2Faddon%2Fjebacinstaling%2Fversions%2F&search=Latest%20version%5B%5Cs%5CS%5D%2A%3FReleased%5Cs%2B%28%5BA-Za-z%5D%2B%5Cs%2B%5Cd%7B1%2C2%7D%2C%5Cs%2B%5Cd%7B4%7D%29&replace=%241)





## 📋Usage

- Navigate to instaling.pl and start a session.
- The extension window appears with answer, status, and controls.
- The correct answer auto-fills when available.
- If the answer is incorrect or missing, click "Refetch list" or "Fill now" multiple times.
- You can disable auto-paste via the checkbox if needed.

## ✅Versions

- [v1.1](https://github.com/jurek-zsl/jebacInstaling/releases/tag/v1.2) - A lot of bugs. Contains not all words. Mutliple issues.
- [v1.2](https://github.com/jurek-zsl/jebacInstaling/releases/tag/RELEASE) - Stable. Contains all words you have given by a teacher. No issues has been found. Not full lists (3-5% of words are not available)
