# Bloomsight Frontend

Make sure you have node installed. You can install nodejs via nvm or fnm https://nodejs.org/en/download.

## Development Setup

I recommend using node 20 which is the LTS version of node to prevent setup headaches

1. Setup node version

```
# Using fnm
fnm install 20
fnm use 20

# Using nvm
nvm install 20
nvm use 20
```

2. Clone the project (including the previous directory)

```
git clone https://github.com/theinquisitorjif/bloomsight_webapp_mvp
```

3. Create `.env` file in `/frontend` and fill it with the following contents

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FRONTEND_URL=http://localhost:5173
```

4. Stand up the frontend

```
cd frontend
npm install
npm run dev
```

5. Open up http://localhost:5173 and start developing!

## Notes

1. We are using react-router-dom to navigate between pages
2. We are using tailwindcss and shadcn-UI for fast prototyping
