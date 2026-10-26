# Deploying ProductTrack

The project has a Vite frontend and an Express API. Netlify hosts the frontend;
deploy the API separately to a Node.js host such as Render or Railway.

## Configure MongoDB Atlas and the API

1. Create a MongoDB Atlas cluster and a database user with the minimum permissions
   needed by the application.
2. Configure Atlas Network Access to allow connections from the API host. Follow
   your host's guidance for outbound IPs; avoid allowing access from every IP in
   production.
3. Copy `.env.example` to `.env` in the project root.
4. Replace the placeholders in `MONGODB_URI` with the database user's credentials
   and cluster hostname. URL-encode special characters in the username or
   password.
5. Keep `.env` private. It is ignored by Git; only the placeholder `.env.example`
   should be shared.
6. In your API host's service settings, set `MONGODB_URI` to the Atlas connection
   string and `CLIENT_ORIGIN` to your Netlify site URL. Set the service's root
   directory to `server`, build command to `npm ci`, and start command to
   `npm start`. Set `NODE_ENV` to `production`.
7. Submitted QR scans are stored in the `SubmittedScan` collection. Once the API
   is running, check `https://YOUR-API-HOST/api/health`; a successful Atlas
   connection reports `"database": "connected"`.

For local development, install and start the API from the project root:

```powershell
npm --prefix server install
npm run dev:api
```

The API reads `MONGODB_URI` from environment variables. For local development,
put it in the root `.env` file. Never commit database credentials; if a real
credential was previously committed, rotate it in Atlas.

## Deploy the frontend to Netlify

1. Push the project to a GitHub repository.
2. In Netlify, choose **Add new site** → **Import an existing project**, then
   select the repository.
3. Use the repository root as the base directory. The included `netlify.toml`
   sets the build command to `npm run build` and the publish directory to `dist`.
   The `public/_redirects` file handles SPA routes.
4. In the Netlify site's environment variable settings, add:
   - `VITE_API_BASE_URL` = `https://YOUR-API-HOST/api`
   - `VITE_USE_MOCK_QR_API` = `false` to use the deployed QR API
5. Deploy or trigger a new deploy after changing environment variables. Open the
   Netlify URL when the deployment completes. Copy its exact origin (without a
   trailing slash) to the API host's `CLIENT_ORIGIN` setting and redeploy the API.

The dashboard, stock, login, and registration services currently use mock data
unless `VITE_USE_MOCK_API=false`; the API in this repository currently implements
QR scan and submitted-results endpoints, not those other services. Keep
`VITE_USE_MOCK_API` unset so the app continues using mock data for those sections.

**Security:** Authentication is currently mock/local-only, and the scan API does
not require authentication. Do not use this public deployment for real user or
location data until API authentication and authorization are implemented.

## Run the frontend locally

From the project root:

```powershell
npm install
npm run dev
```

For full local QR functionality, keep the API running in a separate terminal
with `npm run dev:api`, then open the frontend URL printed by Vite (normally
`http://localhost:5173`).
