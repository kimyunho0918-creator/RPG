# MonsterRift Static Edition

MonsterRift Static Edition is a **serverless browser roguelike prototype** made to be pushed directly to **GitHub Pages**.

This version keeps the same core gameplay loop as the earlier backend version:
- starter drafting with a point budget
- wave-based battles
- attack / skill / guard / swap actions
- boss waves every 5 stages
- reward choices after each win

## What changed

This build has **no backend**.
Everything runs in the browser and the save file is stored in `localStorage`.
That means:
- perfect for GitHub Pages
- no Node.js server required
- no database required
- save data is local to each browser/device

## Files

```text
monsterrift-static/
├─ index.html
├─ styles.css
├─ app.js
├─ game-core.js
├─ README.md
└─ .nojekyll
```

## Run locally

You can open `index.html` directly, but a tiny local server is usually cleaner.

### Python
```bash
python -m http.server 8000
```

Then open:
```text
http://localhost:8000
```

## Publish to GitHub Pages

1. Create a GitHub repository.
2. Upload all files in this folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save.
7. After GitHub finishes, your game will be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/
```

## Notes

- Save data is stored only in the browser.
- Clearing browser storage will remove the run.
- This is an original prototype structure and does not include copyrighted monster franchise assets.
