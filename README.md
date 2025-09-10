# 🖕jebacInstaling

Chrome extension for auto completing instaling.pl questions

> [!WARNING]
> Extension might bug or not work sometimes, instaling.pl is shit and not all words have .mp3 files, try to use it on newly started session only and don't refresh page while doing session. If word isn't showing or the wrong one shows, reinstall extension and CTRL+Shift+R instaling.pl page. ALSO don't submit and fill answers fast cause it might also bug.

## ✨Features

- Automatically fetches and displays the next answer word for instaling.pl questions.
- Provides a button to auto-fill the answer field with the correct word.

## ⚙️How it Works

1. The extension queries the currently active tab for the `child_id` parameter.
2. It fetches the next question's word ID from instaling.pl.
3. Retrieves the answer word using the word ID.
4. Displays the word in the extension popup and enables a button to auto-fill the answer field.

## 📥Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the repository folder.

## 📋Usage

- Navigate to instaling.pl and start your session.
- Click the extension icon.
- The popup will show the next answer word.
- Click **Fill Answer** to automatically populate the answer field.
