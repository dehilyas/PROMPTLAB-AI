# PromptLab AI

A small, static web app that turns a basic prompt into a structured one. Version 1 uses **transparent, rule-based templates** and does **not** call a live AI model. No API keys, no backend, no tracking.

## Features

- Five categories: Coding, Image Generation, Writing, Marketing, Study
- Creativity and detail sliders
- One-click copy with confirmation
- Three example prompts
- Clear / reset button
- Friendly empty-input and error messages
- Keyboard friendly (skip link, visible focus, Ctrl/Cmd + Enter to enhance)
- Responsive, dark theme

## Project structure

```
promptlab-ai/
├── index.html   page structure
├── style.css    dark theme and layout
├── script.js    templates and logic
└── README.md    this file
```

## Run it locally

1. Download or clone the project.
2. Double-click `index.html`. It opens in your browser. No install or build step is needed.

(The copy button works best on `http://localhost` or GitHub Pages. On a plain `file://` page it falls back to an older copy method.)

## How the enhancement works

1. Your text is trimmed and checked. Empty or very short input shows a help message.
2. `script.js` holds a `TEMPLATES` object with one entry per category: a role, a context line, a list of steps, an output format, and three style lines.
3. **Detail level** decides how many steps are included (2, 4 or 5) and adds a final quality check on Thorough.
4. **Creativity level** picks one of the three style lines.
5. Your text replaces `{task}` in the context line, and everything is joined into labeled sections: ROLE, CONTEXT, INSTRUCTIONS, STYLE, OUTPUT FORMAT.

Same input and settings always give the same result. To change the output, edit the `TEMPLATES` object.

## Deploy to GitHub Pages

1. Create a new public repository on GitHub named `promptlab-ai`.
2. Upload the four files (**Add file → Upload files**), or push from the command line:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PromptLab AI v1"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/promptlab-ai.git
   git push -u origin main
   ```
3. In the repo, open **Settings → Pages**.
4. Under **Build and deployment**, set Source to **Deploy from a branch**, choose **main** and **/ (root)**, then Save.
5. Wait a minute. Your site is live at `https://YOUR-USERNAME.github.io/promptlab-ai/`.
6. Add that link to your Linktree.

## Ideas for version 2

- Save favorite prompts with `localStorage`
- Add more categories and templates
- Optional AI model integration through your own backend (never put API keys in front-end code)

## License

MIT. Free to use and modify.
