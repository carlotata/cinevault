import { createApp } from './app.js';
import { config } from './config/index.js';

for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`${name} is not set. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

createApp().listen(config.port, () => {
  console.log(`CineVault API running at http://127.0.0.1:${config.port}`);
});
