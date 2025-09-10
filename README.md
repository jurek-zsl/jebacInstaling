# 🖕jebacInstaling

Chrome and Firefox extension for auto completing instaling.pl questions

> [!WARNING]
> Extension might bug or not work sometimes, instaling.pl is shit and not all words have .mp3 files, try to use it on newly started session only and don't refresh page while doing session. If word isn't showing or the wrong one shows, reinstall extension and CTRL+Shift+R instaling.pl page. ALSO don't submit and fill answers fast cause it might also bug.

## ✨Features

- Automatically fetches, displays and pastes correct answer word for instaling.pl questions.

## ⚙️How it Works

1. The extension queries the currently active tab for the `child_id` parameter.
2. It fetches the next question's word ID from instaling.pl.
3. Retrieves the answer word using the word ID.
4. Displays the word in the extension popup and enables a button to auto-fill the answer field.

## 📥Installation

If you use chrome-based browser download jebacInstaling.zip from `Releases`, else download jebacInstaling.xpi

Chrome:
1. Open Chrome and go to `chrome://extensions`.
2. Enable "Developer mode" (top right).
3. Drag & Drop .zip file then select keep.

Firefox:
1. Open Firefox and go to `about:addons`
2. Drag & Drop .xpi file and select install.

## 📋Usage

- Navigate to instaling.pl and start your session.
- The window will appear on page with answer and refetch button.
- When word is found it will autopaste correct answer.
- If it found wrong word or didn't find at all click refetch multiple times.

> [!NOTE]
> Sometimes words don't have .mp3 files so answers wouldn't be found, keep that in mind.
