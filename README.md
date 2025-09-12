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

## 📥Installation

**Chrome:**
1. Download `jebacInstaling.zip` from Releases.
2. Go to `chrome://extensions`.
3. Enable "Developer mode" (top right).
4. Drag & drop the `.zip` file, then select "Keep".

**Firefox:**
1. Download `jebacInstaling.xpi` from Releases.
2. Go to `about:addons`.
3. Drag & drop the `.xpi` file and click "Install".

## 📋Usage

- Navigate to instaling.pl and start a session.
- The extension window appears with answer, status, and controls.
- The correct answer auto-fills when available.
- If the answer is incorrect or missing, click "Refetch list" or "Fill now" multiple times.
- You can disable auto-paste via the checkbox if needed.

## ✅Versions

- [v1.1](https://github.com/jurek-zsl/jebacInstaling/releases/tag/v1.2) - A lot of bugs. Contains not all words. Mutliple issues.
- [v1.2](https://github.com/jurek-zsl/jebacInstaling/releases/tag/RELEASE) - Stable. Contains all words you have given by a teacher. No issues has been found. 