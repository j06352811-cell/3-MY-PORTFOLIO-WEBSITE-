# Daymark — Task Manager

A calm, responsive task manager built as a frontend portfolio project. Daymark helps you turn a busy list into a few thoughtful next steps.

## Live demo

Try Daymark here: [daymark-task-manager-ten.vercel.app](https://daymark-task-manager-ten.vercel.app/)

## Features

- Create, edit, complete, and delete tasks.
- Organize tasks by area, due date, and priority.
- Filter your list by all tasks, today, upcoming, and completed.
- Search task titles, descriptions, and areas.
- See live task counts and a completion progress indicator.
- Automatically save tasks in browser local storage so they persist after refresh.
- Responsive layout for desktop, tablet, and mobile, with keyboard-friendly controls and reduced-motion support.
- A few sample tasks are provided on first launch to make the interface easy to explore. Delete them whenever you like.

## Built with

- React and React Hooks for interactive UI and application state.
- Vite for local development and production builds.
- CSS for responsive styling, layout, and visual details.
- `localStorage` for persistence without a backend.

## Run locally

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To make a production build, run `npm run build`; to serve that build locally, run `npm run preview`.

## How it works

Tasks are held in React state and saved to `localStorage` whenever that state changes. On startup, the app reads and validates the saved data, or shows example tasks when there is no saved list yet. Task views and search results are derived from the same task state, so the summary cards stay in sync with every change.

## What I learned

This project brought together React state, component composition, event handling, CRUD operations, and browser storage. It also gave me practice deriving filtered views from a single source of truth, building an accessible form dialog, and adapting a polished interface across screen sizes.

## Deployment

The live demo is deployed on Vercel. To deploy your own copy, import the GitHub repository into Vercel and use `npm run build` as the build command and `dist` as the output directory. No server or environment variables are required.
