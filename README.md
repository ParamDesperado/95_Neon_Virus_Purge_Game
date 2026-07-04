# ⚡ Neon Virus Purge

> A cyberpunk browser shooter inspired by Space Invaders.  
> **Built by Param Sangani.**

---

## 🌐 Live Demo

**[▶ Play Now → YOUR-LINK-HERE](https://your-link-here)**

---

## 🎮 About the Game

**Neon Virus Purge** is a modern take on the classic arcade space shooter.  
You play as an **Antivirus Core** defending a digital system from a wave of descending **Glitch Viruses**.  
Shoot them down before they reach you. Use your **Firewalls** for cover — but they don't last forever.

### Features
- ⚡ **60 FPS** smooth Canvas-based gameplay
- 🎨 **Cyberpunk neon aesthetic** — glitch effects, particle explosions, scanlines
- 🏆 **Persistent High Score Leaderboard** saved in your browser — never resets on refresh
- 🔒 **Firewall barriers** that degrade as they take damage
- 📈 **Accelerating difficulty** — enemies speed up as you eliminate them
- 🎯 **Auto-fire** — hold Space to keep shooting

### Controls

| Key | Action |
|---|---|
| `←` / `→` Arrow Keys | Move left / right |
| `Space` | Shoot (tap or hold) |
| `Enter` on name field | Instantly start game |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Rendering | HTML5 Canvas API |
| Logic | Vanilla JavaScript (ES6 Classes) |
| Styling | Vanilla CSS (glassmorphism, neon glows) |
| Fonts | Google Fonts — Orbitron, Inter |
| Storage | Browser `localStorage` |

No dependencies. No frameworks. No build step.

---

## 🚀 Run Locally

```bash
# Clone or download the project
git clone https://github.com/YOUR_USERNAME/neon-virus-purge.git

# Open in browser (no server needed)
open index.html
```

Or just double-click `index.html` — it works offline out of the box.

---

## 📁 Project Structure

```
neon-virus-purge/
├── index.html    # Game structure & UI overlays
├── styles.css    # All visual styling
├── game.js       # Game engine & logic
└── README.md     # This file
```

---

## 🏆 High Score System

Scores are saved to `localStorage` under the key `neonVirusPurgeScores_v1`.  
Top 5 scores are preserved permanently in your browser — enter your name before starting to claim your spot on the leaderboard!

---

## 📜 Credits

- **Created by:** Param Sangani
- **Inspired by:** Space Invaders (Taito, 1978)

---

*Purge the glitch. Secure the core.*
