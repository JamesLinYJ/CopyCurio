<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1OThARP_WuL_6wFPWZ-83YTWGz-0vqkSn

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your OpenAI API key
3. Start the API server (local data + OpenAI proxy):
   `npm run dev:api`
4. Run the app:
   `npm run dev`

## Notes

- The app stores data on a backend (SQLite), with a local cache for faster startup and offline-friendly reads.
- API base URL defaults to `http://localhost:8787` via `VITE_API_BASE_URL`.
- If you run on iOS simulator or a physical device, set `VITE_API_BASE_URL` to a reachable host (e.g. your Mac LAN IP).
- Tailwind + fonts are bundled locally (no Google Fonts or CDN required).
