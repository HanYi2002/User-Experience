# Campus Lost & Found — React Native (Expo)

This project recreates the main flows and visual language in the supplied Figma/PDF as a mobile-first React Native prototype.

## Run it

1. Install Node.js (LTS).
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npx expo start`
5. Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS.

To run in a browser, run `npm run web` (Expo web support may require `npx expo install react-native-web react-dom`).

## Included screens

- Home
- Search Items with text search and category/type filters
- Report Lost Item
- Report Found Item
- Item Details with Edit and Close report actions
- My Reports
- Notifications with All, Claim Status, Review, and Possible Matches filters
- Claim This Item and Claim Confirmation
- Report Possible Match
- Profile

## Feedback-driven updates

The prototype includes changes based on the five usability testers' suggestions:

- Separate Report Lost Item and Report Found Item actions on the home screen.
- Back navigation that returns to the previous screen.
- Notification categories for Claim Status, Review, and Possible Matches.
- Edit and Close actions inside the report-detail screen. Editing updates the selected demo report; closing marks it as Closed.
- Submitted reports are displayed directly on the confirmation screen.
- A restrained red accent colour highlights primary actions, active navigation, and notification categories.

## Notes

- The supplied PDF shows a desktop-style Figma board with many screen states. This React Native version adapts it to a mobile layout, rather than pixel-perfect desktop dimensions.
- It uses sample data inspired by the PDF, including the Northfield University demo labels. It is not connected to a university system or database.
- Reports and claims are stored in React state while the app is running; data resets after a full app restart.
- The photo picker is currently a placeholder. Add `expo-image-picker` to enable selecting photos.
- For production, add authentication, backend/database storage, authorization, and real notification delivery.


## Final Hi-Fi refinement: item images in search results

Search result cards now display a thumbnail image beside each item name and its details. The prototype selects representative sample images based on the item name/category. These sample images are loaded from Unsplash, so an internet connection is required for them to appear. The report form's photo-upload control is still a placeholder; connecting real user-uploaded photos would require adding an image-picker package and storage/backend support.
