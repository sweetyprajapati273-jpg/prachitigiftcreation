# Prachiti Gift Creation — Real Review Page

This is a GitHub Pages + Firebase Firestore review system.

## Files
- `index.html` — review page
- `style.css` — design
- `app.js` — Firebase + review logic
- `firestore.rules` — database security rules

## Firebase setup
1. Open Firebase Console: https://console.firebase.google.com/
2. Create a new project.
3. Add a Web App (`</>` icon).
4. Copy the `firebaseConfig` object.
5. Open `app.js` and replace the placeholder values in `firebaseConfig`.
6. In Firebase Console → Firestore Database → Create database.
7. Start in production mode.
8. Firestore → Rules → paste the contents of `firestore.rules` and Publish.

## Google review button
1. Get your Google Business Profile review link.
2. In `app.js`, replace:
   `PASTE_YOUR_GOOGLE_REVIEW_LINK`
   with your actual review link.

## GitHub Pages
1. Create a GitHub repository.
2. Upload all four files.
3. GitHub → Settings → Pages.
4. Source: Deploy from a branch.
5. Select `main` and `/root`.
6. Save.
7. Your site will get a GitHub Pages URL.

## Important
GitHub Pages alone cannot permanently store customer reviews. Firestore is the database.

For stronger anti-spam protection, enable Firebase App Check and/or add a moderation/admin workflow before using this publicly at scale.
