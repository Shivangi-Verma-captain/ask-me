# ask-me

Starter for the Tech 1 Lecture 9 class activity: a page with one text box that asks Gemini a question through your own server on Vercel.

## What's inside

| File | What it does |
| --- | --- |
| `index.html` | The page. The form goes inside `<main>`. |
| `style.css` | How it looks, same as web-starter |
| `scripts.js` | Sends the question to your server (empty for now) |
| `api/` | Server code. `api/ask.js` will run on Vercel at `/api/ask`. |
| `.gitignore` | Keeps `.env` out of GitHub. Already done for you. |
| `.env.example` | The names of the keys this project needs, with fake values |

## How to use it

1. Press **Use this template** to get your own copy, and clone it with GitHub Desktop.
2. In your editor, copy `.env.example`, name the copy `.env`, and paste your Gemini key into it. Do this yourself, not through your agent.
3. Check GitHub Desktop: `.env` should not appear in the list of changes.
4. Follow the rest of Lecture 9: ask your agent for `api/ask.js` and the page, then put it on Vercel.

This won't work on GitHub Pages. It needs Vercel to run the code in `api/`.
