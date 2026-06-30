# nest-incubator

REST API на [NestJS](https://nestjs.com/) для учебного проекта **it-incubator**. Бэкенд работает с **MongoDB** (Mongoose), использует модульную архитектуру и покрывает домены: аутентификация, пользователи, блоги, посты, комментарии, сессии, email-уведомления.

Основные модули: `auth`, `user`, `post`, `blog`, `comment`, `session`, `email`, `testing`. Swagger доступен по пути `/swagger` (в development — также статика на `/`).

## Архитектура

Проект организован как **modular monolith**: в корне `src/` три слоя — `app`, `shared`, `modules`. Точка входа `main.ts` остаётся в корне `src/`.

```
src/
├── main.ts                 # bootstrap NestJS-приложения
├── app/                    # composition root: сборка модулей, глобальные настройки HTTP
├── shared/                 # переиспользуемый код без доменной логики
└── modules/                # feature-модули (домены)
```

### `app/` — composition root

Содержит `AppModule` и всё, что относится к **запуску и склейке** приложения:

| Файл | Назначение |
|------|------------|
| `app.module.ts` | Регистрация feature-модулей, глобальных провайдеров (Config, Mongoose, Mailer) |
| `app.settings.ts` | Глобальные pipes, filters, CORS, Swagger — вызывается из `main.ts` и e2e |
| `app.controller.ts` / `app.service.ts` | Корневой health-check эндпоинт |

`app/` импортирует `modules/*` и `shared/*`, но **не содержит бизнес-логики** доменов.

### `shared/` — общий код

Инфраструктурные и cross-cutting вещи, которые используются в нескольких модулях и **не зависят от конкретного домена**:

```
shared/
├── config/                 # ConfigModule: configuration, mongoose, mailer
├── decorators/             # param- и validation-декораторы общего назначения
├── exception-filters/      # глобальные HTTP-фильтры ошибок
├── types/                  # общие типы и enum'ы (Paginator, SortDirections, LikeStatus)
├── validators/             # class-validator constraints + Injectable-валидаторы
└── utils/                  # утилиты (helpers)
```

**Правило:** код в `shared/` не импортирует из `modules/*`. Если декоратор или валидатор нужен только одному модулю — он живёт внутри этого модуля (например, `modules/auth/decorators/`).

### `modules/` — feature-модули

Каждый модуль — изолированный домен с собственным `@Module`, контрактом через `exports` и типичной внутренней структурой:

```
modules/<feature>/
├── api/                    # controllers, HTTP-слой
├── application/            # services, бизнес-логика
├── infrastructure/         # repositories, работа с БД
├── dto/                    # class-validator DTO для HTTP
├── models/                 # Mongoose-схемы, input/output-модели
├── guards/ / strategies/   # при необходимости (auth)
├── decorators/             # декораторы, специфичные для модуля
└── <feature>.module.ts
```

Инфраструктурные модули (`database`, `email`) также располагаются в `modules/` — они регистрируют провайдеры и экспортируют их другим feature-модулям.

| Модуль | Домен |
|--------|-------|
| `auth` | Аутентификация, JWT, Passport strategies |
| `user` | Пользователи |
| `blog` / `post` / `comment` | Контент |
| `session` | Сессии и refresh-токены |
| `email` | Отправка писем (SMTP, шаблоны) |
| `database` | Регистрация Mongoose-моделей |
| `testing` | Служебные эндпoинты для e2e |

### Направление зависимостей

```
main.ts → app/ → modules/ → shared/
                  ↓
            (не наоборот)
```

- `modules/*` может импортировать `shared/*` и другие `modules/*` (через `@Module({ imports })` и прямые импорты типов)
- `shared/*` **не импортирует** `modules/*`
- `app/*` собирает всё вместе, но не содержит доменной логики

Публичный контракт Nest-модуля определяется **`exports` в `@Module`**, а не barrel-файлами (`index.ts`).

### Импорты и алиасы

Path alias `@/*` → `src/*` настроен в `tsconfig.json`. При сборке алиасы разрешаются через `tsc-alias`.

| Контекст | Стиль импорта | Пример |
|----------|---------------|--------|
| Между слоями / модулями | абсолютный с `@/` | `@/modules/auth/auth.module` |
| Внутри одного модуля / папки | относительный | `./dto/login.dto` |

**Порядок импортов** задаётся Prettier (`@trivago/prettier-plugin-sort-imports`) в `.prettierrc.cjs`:

1. `nest`
2. сторонние пакеты (`@nestjs/*`, `express`, …)
3. `@/modules/*`
4. `@/shared/*`
5. `@/app/*`
6. относительные `./` / `../`

Нарушение порядка подсвечивается ESLint-правилом `prettier/prettier` (warning). Исправляется через `yarn format`, Format Document или `yarn lint --fix`.

## Требования

- **Node.js 24.x** (см. `engines` в `package.json`)
- **MongoDB** — для запуска приложения и e2e-тестов
- **Yarn** или **npm**

## Установка

```bash
yarn install
# или
npm install
```

## Запуск

```bash
# обычный старт
yarn start
# npm run start

# режим разработки (watch)
yarn start:dev
# npm run start:dev

# отладка
yarn start:debug
# npm run start:debug

# production-сборка и запуск
yarn build && yarn start:prod
# npm run build && npm run start:prod
```

По умолчанию приложение слушает порт **4000** (переопределяется через `PORT`).

## Скрипты

| Скрипт | Описание |
|--------|----------|
| `build` | Сборка проекта (`nest build` + `tsc-alias` для path aliases → `dist/`) |
| `format` | Форматирование `src/**/*.ts` и `test/**/*.ts` через Prettier |
| `start` | Запуск приложения без watch |
| `start:dev` | Запуск в режиме разработки с hot-reload (`NODE_ENV=development`) |
| `start:debug` | Запуск с Node.js inspector и watch |
| `start:prod` | Запуск собранного приложения из `dist/` (`NODE_ENV=production`) |
| `lint` | ESLint с автоисправлением для `src`, `apps`, `libs`, `test` |
| `test` | Unit-тесты (Jest) |
| `test:watch` | Unit-тесты в watch-режиме |
| `test:cov` | Unit-тесты с отчётом покрытия |
| `test:debug` | Unit-тесты с отладчиком Node.js |
| `test:e2e` | E2e-тесты (`test/jest-e2e.json`). **Требуется** доступная MongoDB: переменная `MONGO_URI` должна указывать на рабочую БД |

## Переменные окружения

Значения читаются через `@nestjs/config` (`src/shared/config/configuration.ts`) и константы модуля auth (`src/modules/auth/constants.ts`).

| Переменная | Назначение |
|------------|------------|
| `PORT` | HTTP-порт (по умолчанию `4000`) |
| `MONGO_URI` | Строка подключения к MongoDB |
| `DB_NAME` | Имя базы (по умолчанию `It-incubator-01-dev`) |
| `DB_TYPE` | Тип БД (`MONGO` / `SQL`) — влияет на паттерн ID |
| `ACCESS_TOKEN_SECRET` | Секрет для access JWT |
| `REFRESH_TOKEN_SECRET` | Секрет для refresh JWT |
| `ACCESS_TOKEN_LIFE_TIME` | TTL access-токена в секундах (минимум 300) |
| `REFRESH_TOKEN_LIFE_TIME` | TTL refresh-токена в секундах |
| `SA_LOGIN` | Логин service account для Basic Auth (по умолчанию `admin`) |
| `SA_PASSWORD` | Пароль service account для Basic Auth (по умолчанию `qwerty`) |
| `NODEMAILER_USER_TRANSPORT` | Учётная запись SMTP для отправки писем |
| `NODEMAILER_PASSWORD_TRANSPORT` | Пароль SMTP |
| `MAIN_URL` | Базовый URL приложения (ссылки в email) |
| `NODE_ENV` | `development` / `production` — влияет на Swagger и фильтры ошибок |

## Authentication

Аутентификация реализована через **Passport**, **@nestjs/passport** и **@nestjs/jwt**. Каждый способ входа вынесен в отдельную **strategy**; контроллеры защищаются соответствующими **guard**-обёртками над `AuthGuard('имя-стратегии')`.

### Структура модуля `src/modules/auth/`

```
auth/
├── api/auth.controller.ts          # HTTP-эндпоинты
├── application/auth.service.ts     # бизнес-логика: login, refresh, registration, logout, recovery
├── decorators/                     # декораторы, специфичные для auth
├── strategies/
│   ├── local.strategy.ts           # login + password
│   ├── access-jwt.strategy.ts      # Bearer access token
│   ├── refresh-jwt.strategy.ts     # cookie refreshToken
│   └── basic.strategy.ts           # Basic Auth (service account)
├── guards/
│   ├── local-auth.guard.ts
│   ├── access-jwt-auth.guard.ts
│   ├── refresh-jwt-auth.guard.ts
│   ├── basic-auth.guard.ts
│   └── get-userId-from-bearer-token.ts  # опциональный Bearer (без блокировки запроса)
├── constants.ts
└── dto/
```

### Стратегии и guards

| Strategy | Guard | Источник credentials | Где используется |
|----------|-------|----------------------|------------------|
| `local` (passport-local) | `LocalAuthGuard` | body: `loginOrEmail` + `password` | `POST /auth/login` |
| `jwt-access` (passport-jwt) | `AccessJwtAuthGuard` | header `Authorization: Bearer <accessToken>` | `GET /auth/me`; мутации постов: `POST /posts`, `POST /posts/:postId/comments`, `PUT /posts/:id`, `PUT /posts/:postId` |
| `jwt-refresh` (passport-jwt) | `RefreshJwtAuthGuard` | cookie `refreshToken` | `POST /auth/logout` |
| `basic` (passport-http) | `BasicAuthGuard` | header `Authorization: Basic …` | все маршруты `/users/*`; `DELETE /posts/:id` |

**Опциональный Bearer** — guard `GetUserIdFromBearerToken` (не Passport-strategy): декодирует access JWT без верификации и кладёт `userId` в `request.userId`, не блокируя запрос при отсутствии или невалидном токене. Используется на read-only эндпоинтах:

- `GET /posts`, `GET /posts/:id`, `GET /posts/:postId/comments`
- `GET /blogs/:blogId/posts`

### Поток login

```
POST /auth/login
  → LocalAuthGuard
  → LocalStrategy.validate(loginOrEmail, password)
  → req.user = User
  → AuthService.login(user, ip, userAgent)
      → signAccessAndRefreshToken(userId, deviceId)
      → создание сессии в MongoDB
  → refreshToken в httpOnly cookie
  → { accessToken } в теле ответа
```

`POST /auth/refresh-token` обновляет пару токенов по cookie `refreshToken` через `AuthService.refreshToken` (без Passport guard; проверка сессии по `deviceId` + `iat`).

### JWT payload

Access и refresh токены подписываются **разными секретами** (`ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`):

```json
{ "userId": "<mongoId>", "deviceId": "<uuid>" }
```

После успешной JWT-стратегии пользователь доступен через декоратор `@User()` (`req.user`). Для logout дополнительно используется `@RefreshTokenJwtPayload()` с полным payload refresh-токена (`userId`, `deviceId`, `iat`).

### Эндпоинты auth (без guard)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/auth/registration` | Регистрация |
| `POST` | `/auth/registration-email-resending` | Повторная отправка письма |
| `POST` | `/auth/registration-confirmation` | Подтверждение email |
| `POST` | `/auth/password-recovery` | Запрос восстановления пароля |
| `POST` | `/auth/new-password` | Установка нового пароля |
| `POST` | `/auth/refresh-token` | Обновление access/refresh по cookie |

### Почему Passport, а не кастомные guards

1. **Разделение ответственности** — strategy отвечает за *как* извлечь и проверить credentials; guard — *когда* применять проверку; controller — *что* делать с аутентифицированным пользователем.
2. **Стандартный паттерн NestJS** — предсказуемая структура, проще писать unit/e2e-тесты и подключать новые способы входа.
3. **Именованные стратегии** — `jwt-access` и `jwt-refresh` используют разные секреты, источники токена (header vs cookie) и логику `validate`, без смешивания в одном guard.
4. **Меньше дублирования** — парсинг header/cookie, verify JWT и загрузка пользователя из БД не повторяются в каждом контроллере.
5. **Экосистема Passport** — готовые адаптеры `passport-local`, `passport-jwt`, `passport-http` вместо самописных парсеров.
6. **Единообразный контекст запроса** — после guard/strategy пользователь всегда в `req.user`, что стыкуется с декоратором `@User()`.

## Лицензия

Проект помечен как `UNLICENSED` (private).
