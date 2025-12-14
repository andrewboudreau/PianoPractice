# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based piano practice system with ASP.NET Core backend and vanilla JavaScript frontend.

**Live site:** https://andrewboudreau.github.io/PianoPractice/

## Commands

```bash
dotnet build                                    # Build solution
dotnet run --project src/PianoPractice.Web     # Run web server (http://localhost:5000)
dotnet test                                     # Run Playwright tests
```

First time running tests, install Playwright browsers:
```bash
pwsh tests/PianoPractice.Tests/bin/Debug/net10.0/playwright.ps1 install
```

## Project Structure

```
/src/PianoPractice.Web      # ASP.NET Core host
  wwwroot/                   # Static files (single source of truth)
    index.html, *.html
    js/                      # ES modules
/tests/PianoPractice.Tests  # Playwright + MSTest integration tests
```

GitHub Actions deploys wwwroot to GitHub Pages on push to master.

## Architecture

### AudioScheduler (wwwroot/js/audio-scheduler.js)

The core timing engine. Uses Web Audio API's high-precision clock with a lookahead scheduler pattern to avoid timing drift from JavaScript's `setInterval`.

Key pattern for new tools:
```javascript
import { AudioScheduler } from './audio-scheduler.js';

const scheduler = new AudioScheduler({
    bpm: 120,
    onBeat: (time) => {
        scheduler.playTone(time, 800);  // or playNote(time, 'C', 4)
        scheduler.scheduleCallback(time, () => updateUI());
        return false;  // return false to stop
    },
    onStop: () => resetUI()
});
```

Important: `onBeat` receives audio context time (not wall clock). Use `scheduleCallback()` to sync UI updates with audio. Never modify shared state directly in `onBeat` - capture values in closures for callbacks.

### Practice Tools

Each tool has:
- HTML file with inline CSS in wwwroot
- Corresponding JS module in wwwroot/js that imports AudioScheduler
- Self-contained UI logic initialized on DOMContentLoaded

### Adding New Practice Tools

1. Create `wwwroot/newtool.html` with UI
2. Create `wwwroot/js/newtool.js` importing AudioScheduler
3. Implement `onBeat` callback for the exercise logic
4. Add link to `wwwroot/index.html`
5. Add Playwright test in tests/PianoPractice.Tests
