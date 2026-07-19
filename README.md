# nest-incubator

REST API на [NestJS](https://nestjs.com/) для учебного проекта **it-incubator**. Бэкенд работает с **PostgreSQL** ([TypeORM](https://typeorm.io/)), использует модульную архитектуру и покрывает домены: аутентификация, управление устройствами и сессиями, пользователи, блоги, посты, комментарии, email-уведомления.

Основные модули: `auth`, `security`, `user`, `post`, `blog`, `comment`, `like`, `session`, `email`, `testing`. Swagger доступен по пути `/api` (в development — также статика на `/`).

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

| Файл                                   | Назначение                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `app.module.ts`                        | Регистрация feature-модулей, глобальных провайдеров (Config, TypeORM, Mailer) |
| `app.settings.ts`                      | Глобальные pipes, filters, CORS, Swagger — вызывается из `main.ts` и e2e      |
| `app.controller.ts` / `app.service.ts` | Корневой health-check эндпоинт                                                |

**Состав `AppModule`** (глобальная инфраструктура помимо feature-модулей):

| Регистрация                                             | Назначение                                     |
| ------------------------------------------------------- | ---------------------------------------------- |
| `ScheduleModule.forRoot()`                              | Cron-планировщик (очистка просроченных сессий) |
| `ThrottlerModule.forRoot({ ttl: 10, limit: 5 })`        | Rate limiting: 5 запросов за 10 секунд на IP   |
| `{ provide: APP_GUARD, useClass: ThrottlerGuard }`      | Глобальный throttling для всех маршрутов       |
| `CqrsModule.forRoot()`, `TypeOrmModule`, `MailerModule` | CQRS, PostgreSQL, SMTP                         |

`app/` импортирует `modules/*` и `shared/*`, но **не содержит бизнес-логики** доменов.

### `shared/` — общий код

Инфраструктурные и cross-cutting вещи, которые используются в нескольких модулях и **не зависят от конкретного домена**:

```
shared/
├── core/                   # CoreConfig, CoreModule, validateConfig utility
├── constants/              # pagination defaults (DEFAULT_PAGE_NUMBER, …)
├── decorators/             # param- и validation-декораторы общего назначения
├── dto/                    # BaseQueryParamsDto, PaginatedViewDto
├── exception-filters/      # глобальные HTTP-фильтры ошибок
├── types/                  # общие типы и enum'ы (Paginator, SortDirections, LikeStatus)
├── validators/             # class-validator constraints + Injectable-валидаторы
└── utils/                  # утилиты (helpers, typeorm-pagination)
```

**Правило:** код в `shared/` не импортирует из `modules/*`. Если декоратор или валидатор нужен только одному модулю — он живёт внутри этого модуля (например, `modules/auth/decorators/`).

### `modules/` — feature-модули

Каждый модуль — изолированный домен с собственным `@Module`, контрактом через `exports` и типичной внутренней структурой:

```
modules/<feature>/
├── api/                    # controllers, HTTP-слой (CommandBus / QueryBus)
├── application/
│   ├── commands/           # CQRS command + thin @CommandHandler
│   ├── queries/            # CQRS query + thin @QueryHandler
│   ├── use-cases/          # *UseCase с методом execute()
│   └── services/           # domain services (JWT, hashing, owner-check и т.п.)
├── infrastructure/         # TypeORM entities, repositories, mappers
├── dto/                    # class-validator DTO для HTTP (body и query params list-эндпоинтов)
├── models/                 # domain-модели, input/output для слоя данных
├── guards/ / strategies/   # при необходимости (auth)
├── decorators/             # декораторы, специфичные для модуля
└── <feature>.module.ts
```

Инфраструктурные модули (`database`, `email`) также располагаются в `modules/` — они регистрируют провайдеры и экспортируют их другим feature-модулям.

| Модуль                      | Домен                                                                  |
| --------------------------- | ---------------------------------------------------------------------- |
| `auth`                      | Аутентификация, JWT, Passport strategies                               |
| `security`                  | Управление устройствами и сессиями текущего пользователя               |
| `user`                      | Пользователи                                                           |
| `blog` / `post` / `comment` | Контент                                                                |
| `like`                      | Reactions (subdomain, без HTTP)                                        |
| `session`                   | Сессии и refresh-токены (use-cases, без HTTP; для `auth` и `security`) |
| `email`                     | Отправка писем (SMTP, шаблоны)                                         |
| `database`                  | TypeORM, миграции, seed для локальной разработки                       |
| `testing`                   | Служебные эндпoинты для e2e                                            |

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

### CQRS и Use Cases

Бизнес-логика доменов построена на **@nestjs/cqrs** и паттерне **Use Case**:

| Слой                | Роль                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Controller**      | HTTP: валидация DTO, guards, вызов `commandBus.execute()` / `queryBus.execute()`                                                             |
| **Command / Query** | Объект намерения + тонкий `@CommandHandler` / `@QueryHandler`, делегирующий в use case                                                       |
| **Use Case**        | `application/use-cases/*UseCase`, метод `execute()` — одна операция, одна ответственность                                                    |
| **Domain service**  | Переиспользуемая доменная/техническая логика без привязки к HTTP (например `JwtTokenService`, `BcryptService`, `CommentOwnerCheckerService`) |
| **Repository**      | Доступ к данным (PostgreSQL через TypeORM)                                                                                                   |

**Поток запроса:**

```
HTTP → Controller → CommandBus/QueryBus → Handler → UseCase.execute() → Repository / Domain Service
```

**Регистрация в модуле** — через массивы провайдеров:

```typescript
const blogUseCases = [GetBlogsUseCase, CreateBlogUseCase, /* … */];
const blogCommandHandlers = [CreateBlogHandler, /* … */];
const blogQueryHandlers = [GetBlogsHandler, /* … */];

@Module({
  providers: [
    BlogRepository,
    ...blogUseCases,
    ...blogCommandHandlers,
    ...blogQueryHandlers,
  ],
})
```

**Use case vs domain service:** use case оркестрирует сценарий (проверки, вызов репозиториев и сервисов, маппинг результата). Domain service инкапсулирует узкую переиспользуемую логику, которую вызывают несколько use cases.

### Хранение паролей

Хеширование и сравнение инкапсулированы в `BcryptService` (`shared/core/application/bcrypt.service.ts`), зарегистрированном в `CoreModule`.

**Точки входа:**

| Use case                  | Операция                                                             |
| ------------------------- | -------------------------------------------------------------------- |
| `RegisterUserUseCase`     | создание пользователя через `UserFactoryService.generateHash()`      |
| `CreateUserUseCase`       | создание пользователя (SA) через `UserFactoryService.generateHash()` |
| `ChangePasswordUseCase`   | смена пароля через `BcryptService.generateHash()`                    |
| `CheckCredentialsUseCase` | проверка пароля при логине через `BcryptService.compare()`           |

**Отдельная колонка `salt` не нужна:** bcrypt сохраняет соль внутри строки `passwordHash` (формат `$2b$10$...`). При `compare()` соль извлекается из хеша автоматически — достаточно одного поля в таблице `users`.

Общие утилиты пагинации: class-based query DTO (`BaseQueryParamsDto`, `Get*QueryParamsDto`) с глобальным `ValidationPipe`, `calculateSkip()` и `PaginatedViewDto.mapToView()`; TypeORM-хелперы — `applySort` / `applyPagination` (`shared/utils/typeorm-pagination.ts`).

### Subdomain-модули

Некоторые модули в `modules/` — **subdomain / library modules**: переиспользуемая доменная логика **без собственного HTTP-слоя** (`api/` отсутствует). Эндпoинты остаются у feature-модулей-потребителей; subdomain экспортирует services, types и dto через `@Module({ exports })`.

**Когда создавать:** cross-cutting доменная логика нужна нескольким модулям, но отдельной группы эндпoинтов в Swagger не требуется.

**Структура:**

```
modules/<name>/
├── application/services/     # переиспользуемая логика
├── types/                    # view models, domain types
├── dto/                      # DTO для HTTP-потребителей
└── <name>.module.ts          # без controllers
```

| Модуль    | Назначение                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `like`    | Reactions: mapper (read) + update plan (write); роуты у `post` / `comment` |
| `session` | Сессии и refresh-токены                                                    |
| `email`   | Отправка писем (SMTP, шаблоны)                                             |

**Модуль `session`:** HTTP-слоя нет — use cases вызываются из `auth` (login, refresh, logout) и `security` (список/завершение устройств). `DeleteExpiredSessionsUseCase` по cron каждые 5 минут удаляет сессии, у которых `lastActiveDate` старше `REFRESH_TOKEN_LIFE_TIME`.

Пример: `LikeModule` предоставляет `ReactionsMapperService` и `ReactionUpdateService`; `PostModule` и `CommentModule` импортируют его и владеют `PUT .../like-status`.

### Импорты и алиасы

Path alias `@/*` → `src/*` настроен в `tsconfig.json` (`strictNullChecks: true`). При сборке алиасы разрешаются через `tsc-alias`.

| Контекст                     | Стиль импорта     | Пример                       |
| ---------------------------- | ----------------- | ---------------------------- |
| Между слоями / модулями      | абсолютный с `@/` | `@/modules/auth/auth.module` |
| Внутри одного модуля / папки | относительный     | `./dto/login.dto`            |

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
- **Docker** — для локального PostgreSQL (см. `docker-compose.yml`)
- **Yarn 1.x** (см. `packageManager` в `package.json`)

Для production/staging БД размещается во внешнем сервисе (например, [Neon](https://neon.tech/)); credentials задаются через env (Vercel Dashboard и т.п.).

## Установка

```bash
yarn install
```

## База данных (PostgreSQL)

### Окружения

| Окружение      | `NODE_ENV`               | Где PostgreSQL            | База данных           |
| -------------- | ------------------------ | ------------------------- | --------------------- |
| Разработка     | `development`            | Docker (`localhost:5433`) | `nest_incubator`      |
| E2e / CI       | `testing`                | Docker (`localhost:5433`) | `nest_incubator_test` |
| Staging / Prod | `staging` / `production` | Neon                      | из env (`DB_NAME`)    |

Локально dev и test используют **один контейнер**, но **разные базы** — e2e не затирают dev-данные.

Docker поднимается на порту **5433**, чтобы не конфликтовать с локально установленным PostgreSQL на `5432`.

### Быстрый старт (локально)

```bash
# 1. Поднять PostgreSQL, накатить миграции dev + test
yarn db:setup

# 2. (опционально) Заполнить dev-БД тестовыми данными
yarn db:seed

# 3. Запустить приложение
yarn start:dev
```

### Миграции

Схема БД управляется **только миграциями** (`synchronize: false`). Миграции не накатываются автоматически при старте приложения.

| Скрипт                           | Описание                                                        |
| -------------------------------- | --------------------------------------------------------------- |
| `yarn migration:run`             | Применить миграции (по умолчанию `NODE_ENV=development`)        |
| `yarn migration:revert`          | Откатить последнюю миграцию                                     |
| `yarn migration:generate <Name>` | Сгенерировать файл миграции по diff entities ↔ текущая схема БД |
| `yarn db:migrate`                | Алиас для `migration:run` (dev-БД)                              |
| `yarn db:migrate:test`           | Миграции для test-БД (`NODE_ENV=testing`)                       |

**Production (Neon):**

```bash
yarn cross-env NODE_ENV=production yarn migration:run
```

Credentials для prod храните в `src/env/.env.production.local` (локально) или в Vercel Dashboard. Обязательно: `POSTGRES_SSL=true`.

`migration:generate` **не пишет данные в БД** — только создаёт TypeScript-файл. Чтобы применить изменения схемы, выполните `yarn migration:run`.

### Docker и seed

| Скрипт          | Описание                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `yarn db:up`    | `docker compose up -d` — запустить PostgreSQL                                                  |
| `yarn db:down`  | Остановить контейнер                                                                           |
| `yarn db:reset` | Удалить volume и поднять контейнер заново (чистая БД)                                          |
| `yarn db:setup` | `db:up` + миграции dev + test                                                                  |
| `yarn db:seed`  | Очистить dev-БД и создать дефолтные users/blogs/posts/comments (только `NODE_ENV=development`) |

Фикстуры seed: `src/modules/database/seeds/fixtures/seed.constants.ts`.

### Структура модуля `database`

```
modules/database/
├── database.config.ts       # DatabaseConfig (POSTGRES_* из env)
├── typeorm.config.ts        # TypeOrmModule.forRootAsync
├── data-source.ts           # DataSource для CLI TypeORM
├── migrations/              # SQL-миграции
├── seeds/                   # seed для локальной разработки
└── typeorm-entities.module.ts
```

Слой данных в feature-модулях: **entity** (TypeORM) → **mapper** → **domain model** → **repository**.

## Запуск

```bash
# обычный старт
yarn start

# режим разработки (watch)
yarn start:dev

# отладка
yarn start:debug

# production-сборка и запуск
yarn build && yarn start:prod
```

По умолчанию приложение слушает порт **4000** (переопределяется через `PORT`).

## Скрипты

| Скрипт                      | Описание                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `build`                     | Сборка проекта (`nest build` + `tsc-alias` для path aliases → `dist/`)                               |
| `format`                    | Форматирование `src/**/*.ts` и `test/**/*.ts` через Prettier                                         |
| `start`                     | Запуск приложения без watch (без явного `NODE_ENV` в скрипте)                                        |
| `start:dev`                 | Запуск в режиме разработки с hot-reload (`NODE_ENV=development`)                                     |
| `start:debug`               | Запуск с Node.js inspector и watch (`NODE_ENV=development`)                                          |
| `start:staging`             | Запуск со settings из `src/env/.env.staging` (`NODE_ENV=staging`)                                    |
| `start:prod`                | Запуск собранного приложения из `dist/` (`NODE_ENV=production`)                                      |
| `lint`                      | ESLint с автоисправлением для `src`, `apps`, `libs`, `test`                                          |
| `test`                      | Unit-тесты (Jest)                                                                                    |
| `test:watch`                | Unit-тесты в watch-режиме (`NODE_ENV=testing`)                                                       |
| `test:cov`                  | Unit-тесты с отчётом покрытия (`NODE_ENV=testing`)                                                   |
| `test:debug`                | Unit-тесты с отладчиком Node.js (`NODE_ENV=testing`)                                                 |
| `test:e2e`                  | E2e-тесты (`test/jest-e2e.json`, `NODE_ENV=testing`). **Требуется** PostgreSQL (см. `yarn db:setup`) |
| `typeorm`                   | CLI TypeORM с `data-source.ts`                                                                       |
| `migration:run`             | Применить миграции                                                                                   |
| `migration:revert`          | Откатить последнюю миграцию                                                                          |
| `migration:generate <Name>` | Сгенерировать миграцию по diff entities и БД                                                         |
| `db:up`                     | Запустить PostgreSQL в Docker                                                                        |
| `db:down`                   | Остановить PostgreSQL в Docker                                                                       |
| `db:reset`                  | Пересоздать Docker volume (чистая БД)                                                                |
| `db:migrate`                | Миграции для dev-БД                                                                                  |
| `db:migrate:test`           | Миграции для test-БД                                                                                 |
| `db:setup`                  | `db:up` + `db:migrate` + `db:migrate:test`                                                           |
| `db:seed`                   | Seed dev-БД дефолтными данными                                                                       |

## Конфигурация и settings

### Configuration vs Settings

**Configuration (конфигурация)** — всё, что хранится в **переменных окружения**: секреты, инфраструктура, подключение к БД, пароли, порты и т.п. Эти значения задаёт окружение: ОС, Docker, Kubernetes, CI/CD или панель хостинга (Vercel).

**Settings (настройки приложения и домена)** — параметры бизнес-логики: TTL токенов, лимиты API, интервалы планировщиков. В учебном проекте они пока тоже хранятся в env-файлах (секция `APPLICATION SETTINGS + DOMAIN SETTINGS`).

### Эталон переменных

Полный список переменных с комментариями — в [`src/env/.env.production`](src/env/.env.production). **Новые переменные добавляйте сначала туда**, затем при необходимости переопределяйте в `.env.development`, `.env.testing` или `.env.staging`.

### Module configs (fail-fast)

В прикладном коде **не используйте `process.env` и `ConfigService.get()`** — только типизированные `*Config`-классы с валидацией через `class-validator`:

| Config-класс     | Модуль        | Переменные                                                                                        |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `CoreConfig`     | `shared/core` | `PORT`, `NODE_ENV`                                                                                |
| `DatabaseConfig` | `database`    | `DB_NAME`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SSL` |
| `AuthConfig`     | `auth`        | `ACCESS_TOKEN_*`, `REFRESH_TOKEN_*`, `SA_LOGIN`, `SA_PASSWORD`                                    |
| `EmailConfig`    | `email`       | `NODEMAILER_*`, `MAIN_URL`                                                                        |
| `SessionConfig`  | `session`     | `REFRESH_TOKEN_LIFE_TIME`                                                                         |

`CoreModule` **не глобальный** — модуль, которому нужен `CoreConfig` или другой config, явно импортирует `CoreModule` / модуль-владелец config. При старте приложения невалидная конфигурация приводит к **fail-fast** ошибке в конструкторе config-класса.

### Использование *Config (инъекция и чтение)

**Паттерн:** инжектируйте `*Config` в конструктор и читайте типизированные поля. **Не** используйте `process.env` и **не** вызывайте `ConfigService.get()`.

```typescript
constructor(private readonly authConfig: AuthConfig) {}

this.authConfig.ACCESS_TOKEN_SECRET
```

Реальный пример — `AccessJwtStrategy` и `JwtTokenService` в модуле `auth`: секрет и TTL берутся из `AuthConfig`.

| Что нужно                     | Действие                                            |
| ----------------------------- | --------------------------------------------------- |
| Использовать `AuthConfig`     | Импортировать `AuthModule` (или `AuthConfigModule`) |
| Использовать `DatabaseConfig` | Импортировать `DatabaseModule`                      |
| Использовать `CoreConfig`     | Импортировать `CoreModule`                          |

`CoreModule` **не** помечен `@Global()` — явный импорт модуля-владельца config обязателен.

**Factory-классы:** некоторые config-классы не читают env напрямую, а потребляют другой `*Config`:

| Factory-класс   | Использует       | Назначение                   |
| --------------- | ---------------- | ---------------------------- |
| `TypeOrmConfig` | `DatabaseConfig` | `TypeOrmModule.forRootAsync` |
| `MailerConfig`  | `EmailConfig`    | `MailerModule.forRootAsync`  |

### Создание нового *Config

Пошагово:

1. **Добавьте переменную в [`src/env/.env.production`](src/env/.env.production)** — эталон с комментарием.
2. **Переопределите при необходимости** в `.env.development` / `.env.testing` (локальные fake-значения).
3. **Создайте `src/modules/<feature>/<feature>.config.ts`:**
   - класс `XxxEnvironmentVariables` с декораторами `class-validator`;
   - `@Injectable()` класс `XxxConfig` с полями конфигурации;
   - в конструкторе: `applyValidatedConfig(this, process.env, XxxEnvironmentVariables)`.

   Образцы: [`src/shared/core/config-validation.utility.ts`](src/shared/core/config-validation.utility.ts), [`src/modules/auth/auth.config.ts`](src/modules/auth/auth.config.ts).

4. **Зарегистрируйте в Nest-модуле:** `providers: [XxxConfig]`, `exports: [XxxConfig]`. Если config нужен в `registerAsync` другого модуля (например, `JwtModule`), вынесите отдельный `XxxConfigModule` — см. [`src/modules/auth/auth-config.module.ts`](src/modules/auth/auth-config.module.ts).
5. **Инжектируйте** `XxxConfig` в сервисы, стратегии, контроллеры.

> Не каждому feature-модулю нужен свой `*Config` — только модулям, которые читают env: `auth`, `database`, `email`, `session`, `core`.

### Файлы окружения

| Файл                             | В git | Содержимое                                                                  |
| -------------------------------- | ----- | --------------------------------------------------------------------------- |
| `src/env/.env.production`        | да    | **Эталон**: все переменные; infra/secrets — пустые значения с комментариями |
| `src/env/.env.staging`           | да    | Только **settings**, если отличаются от production                          |
| `src/env/.env.development`       | да    | **Config + secrets (fake)** для локальной разработки                        |
| `src/env/.env.testing`           | да    | **Config + secrets (fake)** для e2e; settings наследуются из production     |
| `src/env/.env.development.local` | нет   | Локальные переопределения разработчика                                      |
| `src/env/.env.production.local`  | нет   | Neon/prod credentials для локального `migration:run`                        |
| `src/env/.env.testing.local`     | нет   | Локальные переопределения для e2e                                           |

Файлы `src/env/.env.*.local` перечислены в `.gitignore` и **никогда не коммитятся**.

### Приоритет загрузки

`NODE_ENV` задаётся в **скриптах** `package.json` через `cross-env`. `@nestjs/config` читает файлы **сверху вниз** — первый найденный ключ побеждает:

```
1. ENV_FILE_PATH (если задан)
2. src/env/.env.${NODE_ENV}.local   ← наивысший приоритет (локальные переопределения)
3. src/env/.env.${NODE_ENV}         ← development / testing / staging / production
4. src/env/.env.production          ← fallback для settings, если ключ не задан выше
```

Переменные, уже заданные в **process.env** (Vercel Dashboard, Docker `-e`, системное окружение), **не перезаписываются** файлами — у них приоритет выше всех `.env`.

Подключение: `src/dynamic-config-module.ts`, первый импорт в `src/app/app.module.ts`.

### Локальная разработка

```bash
# Поднять БД и миграции
yarn db:setup

# (опционально) дефолтные данные
yarn db:seed

# Старт с src/env/.env.development (NODE_ENV=development)
yarn start:dev

# Переопределить только нужные ключи — создайте файл:
# src/env/.env.development.local
# POSTGRES_PORT=5434
# PORT=5000
```

### E2e-тесты

```bash
# PostgreSQL + миграции test-БД
yarn db:setup

# Читает src/env/.env.testing (+ .env.testing.local при наличии)
yarn test:e2e
```

Файлы e2e в `test/`:

| Файл                           | Покрытие                        |
| ------------------------------ | ------------------------------- |
| `app.e2e-spec.ts`              | Корневой health-check           |
| `auth.api.e2e-spec.ts`         | Регистрация, login, password    |
| `user.api.e2e-spec.ts`         | Эндпoинты `/users`              |
| `post.api.e2e-spec.ts`         | Эндпoинты `/posts`              |
| `blog.api.e2e-spec.ts`         | Эндпoинты `/blogs`              |
| `comment.api.e2e-spec.ts`      | Эндпoинты `/comments`           |
| `auth-refresh.e2e-spec.ts`     | Refresh-токены и ротация сессий |
| `auth-throttle.e2e-spec.ts`    | Rate limiting на auth POST      |
| `security-devices.e2e-spec.ts` | Эндпoинты `/security/devices`   |

## Authentication

Аутентификация реализована через **Passport**, **@nestjs/passport** и **@nestjs/jwt**. Каждый способ входа вынесен в отдельную **strategy**; контроллеры защищаются соответствующими **guard**-обёртками над `AuthGuard('имя-стратегии')`.

### Структура модуля `src/modules/auth/`

```
auth/
├── api/auth.controller.ts          # HTTP-эндпоинты (CommandBus / QueryBus)
├── application/
│   ├── commands/                   # LoginCommand, RegistrationCommand, …
│   ├── queries/                    # GetMeQuery
│   ├── use-cases/                  # LoginUseCase, RegistrationUseCase, …
│   └── services/jwt-token.service.ts
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
├── auth.config.ts
└── dto/
```

### Стратегии и guards

| Strategy                     | Guard                 | Источник credentials                         | Где используется                                                                                                      |
| ---------------------------- | --------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `local` (passport-local)     | `LocalAuthGuard`      | body: `loginOrEmail` + `password`            | `POST /auth/login`                                                                                                    |
| `jwt-access` (passport-jwt)  | `AccessJwtAuthGuard`  | header `Authorization: Bearer <accessToken>` | `GET /auth/me`; мутации постов: `POST /posts`, `POST /posts/:postId/comments`, `PUT /posts/:id`, `PUT /posts/:postId` |
| `jwt-refresh` (passport-jwt) | `RefreshJwtAuthGuard` | cookie `refreshToken`                        | `POST /auth/logout`                                                                                                   |
| `basic` (passport-http)      | `BasicAuthGuard`      | header `Authorization: Basic …`              | все маршруты `/sa/users/*`; `DELETE /posts/:id`                                                                       |

**Опциональный Bearer** — guard `GetUserIdFromBearerToken` (не Passport-strategy): декодирует access JWT без верификации и кладёт `{ userId }` в `request.user`, не блокируя запрос при отсутствии или невалидном токене. Используется на read-only эндпоинтах:

- `GET /posts`, `GET /posts/:id`, `GET /posts/:postId/comments`
- `GET /blogs/:blogId/posts`

### Поток login

```
POST /auth/login
  → LocalAuthGuard
  → LocalStrategy.validate(loginOrEmail, password)
  → req.user = { userId }
  → LoginUseCase.execute({ userId, ip, userAgent })
      → JwtTokenService.signAccessAndRefreshToken(userId, deviceId)
      → создание сессии в PostgreSQL (deviceId, lastActiveDate)
  → refreshToken в httpOnly cookie
  → { accessToken } в теле ответа
```

`POST /auth/refresh-token` обновляет пару токенов по cookie `refreshToken` через `RefreshTokenUseCase`: проверка JWT, поиск сессии по `deviceId` + `userId` + `lastActiveDate` из payload; при успехе — ротация refresh (старый refresh становится невалидным).

Cookie `refreshToken`: `httpOnly`, `secure` только в production, `sameSite: 'strict'`, `maxAge` из `REFRESH_TOKEN_LIFE_TIME`.

**TTL токенов** (`ACCESS_TOKEN_LIFE_TIME` / `REFRESH_TOKEN_LIFE_TIME`):

| Окружение             | Access | Refresh |
| --------------------- | ------ | ------- |
| development / testing | 10 с   | 20 с    |
| production            | 300 с  | 72000 с |

### JWT payload

Access и refresh токены подписываются **разными секретами** (`ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`):

```json
{ "userId": "<uuid>", "deviceId": "<uuid>", "lastActiveDate": "<ISO string>" }
```

После успешной JWT-стратегии пользователь доступен через декоратор `@User()` (`req.user`). Для logout дополнительно используется `@RefreshTokenJwtPayload()` с полным payload refresh-токена (`userId`, `deviceId`, `lastActiveDate`).

### Эндпоинты auth (без guard)

| Метод  | Путь                                 | Описание                            |
| ------ | ------------------------------------ | ----------------------------------- |
| `POST` | `/auth/registration`                 | Регистрация                         |
| `POST` | `/auth/registration-email-resending` | Повторная отправка письма           |
| `POST` | `/auth/registration-confirmation`    | Подтверждение email                 |
| `POST` | `/auth/password-recovery`            | Запрос восстановления пароля        |
| `POST` | `/auth/new-password`                 | Установка нового пароля             |
| `POST` | `/auth/refresh-token`                | Обновление access/refresh по cookie |

### Rate limiting

Глобально: **5 запросов за 10 секунд на IP** (`ThrottlerModule.forRoot({ ttl: 10, limit: 5 })` + `ThrottlerGuard` через `APP_GUARD`).

На `AuthController` класс помечен `@SkipThrottle()` — throttling по умолчанию выключен; чувствительные POST-эндпoинты (`login`, `registration`, `password-recovery` и т.п.) явно включают лимит через `@SkipThrottle(false)`.

**Без rate limiting:** `POST /auth/refresh-token`, `POST /auth/logout`, `GET /auth/me`, все маршруты `/security/*` и `/testing/*`.

### Почему Passport, а не кастомные guards

1. **Разделение ответственности** — strategy отвечает за _как_ извлечь и проверить credentials; guard — _когда_ применять проверку; controller — _что_ делать с аутентифицированным пользователем.
2. **Стандартный паттерн NestJS** — предсказуемая структура, проще писать unit/e2e-тесты и подключать новые способы входа.
3. **Именованные стратегии** — `jwt-access` и `jwt-refresh` используют разные секреты, источники токена (header vs cookie) и логику `validate`, без смешивания в одном guard.
4. **Меньше дублирования** — парсинг header/cookie, verify JWT и загрузка пользователя из БД не повторяются в каждом контроллере.
5. **Экосистема Passport** — готовые адаптеры `passport-local`, `passport-jwt`, `passport-http` вместо самописных парсеров.
6. **Единообразный контекст запроса** — после guard/strategy пользователь всегда в `req.user`, что стыкуется с декоратором `@User()`.

## Security

Модуль `security` — HTTP-слой для управления устройствами (сессиями) **текущего пользователя**. Делегирует в use cases модуля `session`.

| Метод    | Путь                          | Guard      | Описание                                                       |
| -------- | ----------------------------- | ---------- | -------------------------------------------------------------- |
| `GET`    | `/security/devices`           | Access JWT | Список устройств пользователя                                  |
| `DELETE` | `/security/devices`           | Access JWT | Завершить все сессии, кроме текущей (`deviceId` из access JWT) |
| `DELETE` | `/security/devices/:deviceId` | Access JWT | Завершить сессию конкретного устройства                        |

## Testing module

`DELETE /testing/all-data` (только при `NODE_ENV=testing`) очищает данные в PostgreSQL для e2e и **сбрасывает in-memory storage throttler**, чтобы лимиты не мешали последующим тестам.

## Лицензия

Проект помечен как `UNLICENSED` (private).
