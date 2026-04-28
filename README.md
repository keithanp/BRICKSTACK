# brickstack.ai

Pitch demo: a single-page **React + Vite + Tailwind** app that mocks turning photos or prompts into custom LEGO® kits.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # production bundle
npm run preview # serve dist
```

## Demo images (optional)

Add these files under `public/assets/` to replace placeholders:

- `pablo-escobar-box.jpg` — box art  
- `pablo-escobar-parts.jpg` — parts list  
- `pablo-escobar-build.jpg` — instructions preview  

Paths are defined at the top of `src/App.jsx`. If files are missing, the UI falls back to labeled placeholder images.

## Stack

React 18, Vite 5, Tailwind 3. No backend or router — all state is local.
