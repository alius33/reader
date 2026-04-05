---
description: Extract post/reel URLs from an Instagram saved folder page open in Chrome
allowed-tools: Read, Write, Bash
---

# /instagram-extract-urls — Extract URLs from Instagram Saved Folders

Extract all post and reel URLs from an Instagram saved collection page that the user has open in Chrome.

**Usage:**
- `/instagram-extract-urls` — guide the user through extracting URLs from the page they have open
- `/instagram-extract-urls <output-file>` — same, but save results to a specific file

---

## Step 1: Confirm the page is ready

Ask the user:
1. Is the Instagram saved folder page open in Chrome?
2. Have you scrolled all the way to the bottom so every item is loaded?

If they haven't scrolled to the bottom, tell them:
> Scroll slowly to the very bottom of the saved folder until no more items load. Instagram lazy-loads content — anything not scrolled into view won't be in the DOM.

---

## Step 2: Provide the extraction script

Tell the user to open Chrome DevTools (F12), click the Console tab, and paste:

```
allow pasting
```

Then press Enter (Chrome requires this the first time to allow pasting code).

Then paste this script:

```javascript
const links = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map(a => a.href);
const unique = [...new Set(links)].filter(u => u.includes('/p/') || u.includes('/reel/'));
copy(unique.join('\n'));
console.log(unique.length + ' URLs copied to clipboard');
```

This copies all unique post/reel URLs to the clipboard.

---

## Step 3: If it returns 0 URLs

Instagram's DOM changes frequently. If the above returns 0, run this diagnostic:

```javascript
const allLinks = [...document.querySelectorAll('a')].map(a => a.href);
console.log('Total links:', allLinks.length);
const igLinks = allLinks.filter(u => u.includes('instagram.com/p/') || u.includes('instagram.com/reel/'));
console.log('IG post/reel links:', igLinks.length);
if (igLinks.length === 0) {
  console.log('Sample links on page:', allLinks.slice(0, 20));
}
```

Read the output and adjust the selector to match whatever pattern Instagram is currently using.

---

## Step 4: Save the URLs

Once the user pastes the URLs, save them to the output file.

Default output file: `inbox/reels/urls.txt` (one URL per line)

If an `$ARGUMENTS` output file was specified, use that instead.

Report the count and remind the user what to do next:
- For reels processing: `/reel-process --file inbox/reels/urls.txt --cookies-from-browser chrome`
- For other uses: the file is at the output path, one URL per line

---

## Notes

- Instagram uses `/p/` URLs for both posts and reels in saved folder grids — the `/reel/` path only appears when viewing a reel directly
- The user MUST scroll through the entire folder first — Instagram lazy-loads grid items
- `allow pasting` must be typed first in Chrome DevTools before pasting scripts
- This works on any Instagram grid page: saved folders, profile posts, tagged posts, explore
