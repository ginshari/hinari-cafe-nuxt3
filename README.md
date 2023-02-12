# hinari-cafe-nuxt3
VTuber理原ひなりさんの非公式ファンサイトです

## Architecture

| Main Framework | UI Framework | DataBase | Deployment |
| --- | --- | --- | ---|
| Nuxt3 | Vuetify3 | MongoDB Atlas | Cloudflare Pages |

## Setup

Make sure to install the dependencies:

```
npm install
```

Create .env file:

```
NUXT_API_KEY=YOUR_ATLAS_API_KEY
NUXT_PUBLIC_API_BASE=YOUR_ATLAS_API_BASE
```

## Development Server

Start the development server on http://localhost:3000

```
npm run dev
```

## Production

Build the application for production:

```
npm run generate
```

Locally preview production build:

```
npm run preview
```
