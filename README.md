# hinari-cafe-nuxt3

VTuber理原ひなりさんの非公式ファンサイトです

## Architecture

| Main Framework | UI Framework | DataBase      | Deployment       |
| -------------- | ------------ | ------------- | ---------------- |
| Nuxt3          | Vuetify3     | MongoDB Atlas | Cloudflare Pages |

## Setup

Make sure to install the dependencies:

```
npm install
```

Create .env file:

```
NUXT_MONGODB_URI=YOUR_MONGODB_URI

# MongoDB Atlas Admin API (for deployment scripts)
MONGODB_ATLAS_GROUP_ID=YOUR_PROJECT_ID
MONGODB_ATLAS_PUBLIC_KEY=YOUR_PUBLIC_KEY
MONGODB_ATLAS_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

## Deployment

Cloudflare PagesはIPが動的なため、ビルド時にMongoDB Atlasへ接続するには一時的にIP制限を解除する必要があります。

```bash
npm run atlas:allow   # 6時間限定で全IP許可を追加
git push              # Cloudflareでビルド
npm run atlas:remove  # (任意) すぐに許可を削除
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
