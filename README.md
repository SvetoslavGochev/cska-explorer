# CSKA Explorer

CSKA Explorer е фенски сайт за ЦСКА и Efbet Лига с локален Node server, live API endpoint и статичен build за GitHub Pages.

## Live Site

След успешен GitHub Pages deploy сайтът е достъпен на:

https://svetoslavgochev.github.io/cska-explorer/

## Какво включва

- Класиране в Efbet Лига и информация за състава на ЦСКА
- Локален API endpoint на `/api/data` с кеш и fallback snapshot
- UI на български и английски с адаптивен layout
- Root entry point, използван еднакво локално и в production
- Отделен static build за GitHub Pages в `dist-static/`

## Стартиране локално

Изисквания:

- Node.js 18+

Стъпки:

1. Инсталирай зависимостите с `npm install`.
2. Стартирай локалния server с `npm start`.
3. Отвори `http://localhost:3000`.

Локалният server обслужва canonical root файловете и API endpoint-ите. Не стартирай сайта чрез директно отваряне на `index.html` от `file://`, защото така няма да работят API заявките и fallback логиката.

## Основна структура

- [index.html](index.html) — canonical entry point на сайта
- [app.js](app.js) — основна клиентска логика и rendering
- [styles.css](styles.css) — основни стилове
- [runtime-config.js](runtime-config.js) — runtime конфигурация за frontend-а
- [server.js](server.js) — локален HTTP server и `/api/*` endpoints
- [data/bootstrap-data.json](data/bootstrap-data.json) — fallback snapshot за frontend и backend
- [public/test-api.html](public/test-api.html) — помощна страница за бърза проверка на `/api/data`
- [dist-static](dist-static) — генериран static build за GitHub Pages

## Static Build

Статичният build се генерира от canonical root файловете, а не от отделен template в `public/`.

Команда:

- `node generate-static.js`

Резултат:

- build файловете се записват в `dist-static/`
- GitHub Pages workflow публикува точно `dist-static/`

## Deploy

### Vercel

- Vercel използва root [index.html](index.html) като production entry point
- [api/data.js](api/data.js) обслужва live класирането; GitHub Pages frontend-ът го извиква през `CSKA_DATA_API_URL`
- При недостъпен източник endpoint-ът запазва последния валиден резултат в паметта на инстанцията и маркира snapshot fallback-а като остарял
- Почасовото обновяване се задейства от [.github/workflows/refresh-standings-api.yml](.github/workflows/refresh-standings-api.yml)
- Почасовият workflow обновява endpoint-а и записва само променено, валидирано класиране в snapshot-а за GitHub Pages

### GitHub Pages

- GitHub Pages публикува генерирания static build от `dist-static/`
- Build-ът се създава с `node generate-static.js`
- Подходящо е, когато искаш чисто статична версия без локалния Node server

## Ops Helpers

Бързи команди за поддръжка и проверка:

- `npm run ops:refresh` — обновява статистиките на играчите в `data/bootstrap-data.json` от Sportal + Flashscore и добавя ред в `data/refresh-log.ndjson`
- `npm run ops:verify:local` — проверява локалните `api/health` и `api/data` метрики
- `npm run ops:verify:live` — проверява live данните от GitHub Pages (`updatedAt`, играчи, флагове, мачове)
- `npm run ops:refresh-and-push` — изпълнява refresh + live verify + commit + push на `data/bootstrap-data.json` и `data/refresh-log.ndjson`

Лог файл:

- `data/refresh-log.ndjson` съдържа по един JSON ред за всяко обновяване: timestamp, брой играчи, флагове, мачове и source

## Backend Auto-Refresh

- Локалният Node server обновява автоматично на всеки 60 минути; Vercel serverless функцията не разчита на `setInterval`
- `/api/data` използва кратък CDN cache и обновява при изтичането му; `/api/data?refresh=1` задейства live refresh
- Почасовият GitHub Actions workflow може да се пусне и ръчно от Actions
- За защита на принудителния refresh задайте еднакъв `CRON_SECRET` във Vercel и GitHub Actions Secrets; може да зададете и `CSKA_DATA_API_URL` като GitHub Actions Variable
- При неуспех се връща последният валиден резултат или `data/bootstrap-data.json`, като `source.validation.standingsUpdated` е `false` и UI показва предупреждение

## Screenshot

![CSKA Explorer UI](screenshots/ui-overview.png)
