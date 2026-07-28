# settpaste

Fast pastebin with syntax highlighting and automatic provider rotation.

## Features

- 🎨 Syntax highlighting (JavaScript, Python, JSON, XML, CSS, Bash)
- 🔄 Provider rotation (paste.rs → SafeNote)
- 📋 One-click URL copy
- 🚀 Zero API keys required
- 🌙 CS16-inspired retro UI

## Providers

| Provider     | Type      | Lifetime      | Notes             |
| ------------ | --------- | ------------- | ----------------- |
| **paste.rs** | Public    | Permanent     | Simple text paste |
| **SafeNote** | Encrypted | 48h / 3 reads | Self-destructing  |

Each send rotates to the next provider.

## Tech Stack

- React 19 + Vite 6
- highlight.js (selective imports)
- Vercel Serverless Functions (CORS proxy)

## Structure

```
├── api/
│   ├── paste-rs.js     # paste.rs proxy
│   └── safenote.js     # SafeNote proxy
├── src/
│   ├── App.jsx         # Main component
│   ├── App.css         # Styles
│   └── main.jsx        # Entry point
├── index.html
└── vite.config.js
```
