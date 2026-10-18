# Signal — Intelligence, in context.

An independent editorial website and fully interactive, responsive AI technology journal, built with React, TypeScript, Vite, Framer Motion, and Express.

## Run locally

1. Install [Node.js 20.19+ or 22.12+](https://nodejs.org/).
2. Open a terminal in `web/`, then install dependencies:

   ```sh
   npm install
   ```

3. Start the website and its local API:

   ```sh
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173). The Vite development server proxies `/api` requests to the accompanying Express API.

The default edition contains explicitly identified, AI-generated demonstration articles. They are editorial examples, **not live news or independently verified reporting**. The demo remains usable without an API key or an internet connection.

## Optional live news

Copy `.env.example` to `.env` and configure a [NewsAPI.org API key](https://newsapi.org/):

```dotenv
NEWS_API_KEY=your_newsapi_key
PORT=3001
```

Restart the server. In live mode, the Express server makes the request to NewsAPI, keeping the provider key on the server rather than exposing it in the browser bundle. Live headlines are attributed and link to their original publisher. The response text available through NewsAPI is a short summary; read the linked original article for complete reporting. When the key is absent, the interface labels its demo stories honestly. If a provider request fails, Signal displays an error alongside the still-available demo edition.

## Production

```sh
npm run build
npm start
```

The Express server serves the production build and `/api` from the same origin on port 3001 (or `PORT`). `npm run preview` launches Vite's static preview; it does not start the NewsAPI proxy.

## Features

- Responsive editorial homepage, newest stories, popular reads, category pages, article detail pages, keyword search, bookmarks, About, Contact, and not-found pages.
- Persistent reading list, dark/light theme, and newsletter demo subscriptions, stored locally in the reader's browser.
- The newsletter and contact forms are transparent interactive previews: no email or contact message is sent or stored on a server.
- Keyboard-accessible search (`Ctrl+K` / `⌘K`, Escape to close), reduced-motion support, clear focus states, and accessible, labelled controls.
- Sharing controls, reading time, author and category metadata, related stories, pagination controls, newsletter validation, SEO/social metadata, and custom illustration assets made from CSS.
- Optional, server-side NewsAPI integration; API keys are never placed in client-side `VITE_` variables.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run test
npm run build
```
