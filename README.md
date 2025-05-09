# Saath - Family Local Guide

A mobile application that helps families discover and explore family-friendly places in their local area.

## Features

- Search for family-friendly places nearby
- View detailed information about each place
- Save favorite places for quick access
- Map view of nearby locations
- Dark mode support
- Offline favorites storage
- Family-friendly place recommendations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/saath-family-guide.git
cd saath-family-guide
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your API keys:
```
FOURSQUARE_API_KEY=your_foursquare_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Development

To start the development server:
```bash
npm start
# or
yarn start
```

## Building for Production

### Android

1. Configure app.json with your Android package name and version
2. Build the Android app:
```bash
eas build --platform android
```

### iOS

1. Configure app.json with your iOS bundle identifier and version
2. Build the iOS app:
```bash
eas build --platform ios
```

## Play Store Submission

1. Create a Google Play Developer account
2. Prepare store listing:
   - App name: "Saath - Family Local Guide"
   - Short description
   - Full description
   - Screenshots
   - Feature graphic
   - App icon
   - Privacy policy URL

3. Create a new release:
   - Upload the AAB file
   - Set release notes
   - Review and roll out

## App Store Submission

1. Create an Apple Developer account
2. Prepare App Store listing:
   - App name
   - Description
   - Keywords
   - Screenshots
   - App icon
   - Privacy policy URL

3. Submit for review:
   - Upload the IPA file
   - Complete the submission form
   - Wait for review

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@saathfamilyguide.com or visit our website.
