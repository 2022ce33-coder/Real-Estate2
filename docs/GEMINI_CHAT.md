# Gemini Chatbot (UI + Integration)

This project includes a simple, attractive floating Gemini chat widget at the bottom-right of the app.

## Files added

- `src/components/chat/GeminiChatbot.tsx` — the floating UI component (button + panel, message list, input).
- `src/integrations/gemini/client.ts` — small helper that calls `VITE_GEMINI_API_URL` (or returns a mock when keys are absent).

## Setup

1. Add environment variables in `.env` (example already added):

```
VITE_GEMINI_API_URL="https://your-proxy.example.com/api/gemini"
VITE_GEMINI_API_KEY="your_api_key_here"
```

2. **Security note:** Do NOT embed secret API keys directly into client-side code for production. Instead, create a server-side endpoint (`/api/gemini`) that safely signs requests to Google Gemini (or PaLM / other LLM) and keeps your keys secret. Point `VITE_GEMINI_API_URL` at that proxy endpoint.

3. The client will use the `sendToGemini(prompt)` helper and expects the backend to return JSON containing text (e.g., `{ text: "..." }`). Adjust `src/integrations/gemini/client.ts` if your backend responds with a different shape.

## Behavior

- Click the floating "G" button to open/close the chat.
- Type a message and press Enter or click Send.
- Messages are stored in `localStorage` for session persistence (can be cleared via the "Clear" button).

## Styling

The widget is implemented with Tailwind classes and follows the project's design tokens. Edit `GeminiChatbot.tsx` to further customize animations or appearance.

---

If you'd like, I can also add:
- A small example serverless function to proxy requests to Gemini (Netlify / Vercel / Express) — which would make it safe to add the real API key.
- Streaming responses support and improved message formatting.

Tell me which you'd like me to add next.