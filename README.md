# CS Market

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-required-336791)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

CS Market - это full-stack маркетплейс для скинов CS2. Приложение покрывает основной сценарий платформы цифровых предметов: аккаунты пользователей, инвентарь, объявления о продаже, резервирование товаров в корзине, покупку, аренду, платежные операции, обращения в поддержку и администрирование.

Курсовая работа с Java/Spring backend, PostgreSQL в качестве слоя данных и React/TypeScript frontend.

## Возможности

- Регистрация и вход по Steam ID с BCrypt-хешированием пароля и bearer session token.
- Защищенные frontend-маршруты с сохранением состояния авторизации и автоматическим выходом при `401`.
- Маркет активных объявлений со строкой поиска, фильтрами по редкости/состоянию/коллекции, пагинацией и графиками истории цен.
- Страница инвентаря, где пользователь может создать объявление о продаже, создать объявление аренды или мгновенно продать предмет по instant price, заданной администратором.
- Корзина с резервированием объявлений и покупкой отдельных товаров.
- Транзакционный сценарий покупки через PostgreSQL stored procedure `execute_purchase`.
- Сценарий аренды через PostgreSQL stored procedure `rent_skin` с проверкой срока аренды и очисткой истекших контрактов.
- Страница платежей для пополнения и вывода средств с обновлением баланса после успешной смены статуса операции.
- Система поддержки с тикетами, вложениями, историей обращений пользователя и управлением статусами со стороны администратора.
- Заявки на удаление аккаунта с отменой со стороны пользователя и approve/reject со стороны администратора.
- Админ-панель для пользователей, ролей, заявок на удаление, тикетов поддержки, instant prices и очистки резервов.
- Плановая очистка истекших резервов корзины.

## Стек

**Backend**

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring JDBC
- Spring Validation
- PostgreSQL
- Lombok
- Maven Wrapper

**Frontend**

- React 19
- TypeScript
- Vite
- React Router
- ESLint

**Слой базы данных**

- JPA entities и repositories для обычных CRUD-операций.
- JDBC/stored procedures для критичных операций с деньгами и владением предметами:
  - `execute_purchase`
  - `rent_skin`
  - `check_user_balance`
  - `cleanup_expired_reservations`
  - `cleanup_expired_rentals`

## Основные пользовательские сценарии

1. Пользователь регистрируется или входит в аккаунт и получает bearer token, который хранится на frontend.
2. Пользователь открывает маркет, фильтрует скины, смотрит историю цены и добавляет объявление в корзину.
3. Корзина резервирует объявление, а checkout выполняет транзакционную покупку.
4. Продавец открывает инвентарь, создает обычное объявление о продаже, создает объявление аренды или использует instant sell.
5. Объявление аренды можно арендовать на выбранное число дней; списание баланса и изменение владения обрабатываются на уровне базы данных.
6. Пользователи могут управлять пополнениями/выводами, тикетами поддержки и заявками на удаление аккаунта.
7. Администраторы управляют ролями, тикетами поддержки, заявками на удаление, instant prices и истекшими резервами.

## Архитектура

```text
frontend/React UI
  -> api.ts fetch wrapper
  -> защищенные маршруты и auth context
  -> страницы market, cart, inventory, rent, payments, support, admin

backend/Spring Boot API
  -> controllers открывают REST endpoints
  -> services проверяют бизнес-правила
  -> repositories работают с JPA-доступом к данным
  -> DAO layer вызывает PostgreSQL procedures для транзакционных операций

PostgreSQL
  -> users, sessions, credentials
  -> skins, inventory, sale listings
  -> carts, cart items, transactions
  -> rental listings and contracts
  -> payments, tickets, deletion requests
```

Дополнительные UML-диаграммы лежат в [`docs/uml`](docs/uml), а общий сгенерированный обзор доступен в [`docs/uml.svg`](docs/uml.svg).

## Области API

| Область | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Market | `GET /market/sale-listings`, `POST /market/sale-listings`, `POST /market/sale-listings/{id}/cancel`, `POST /market/sale-listings/{id}/instant-sell` |
| Skins | `GET /market/skins`, `GET /market/skins/{skinId}/instant-price`, `GET /skins/{skinId}/price-history` |
| Cart | `POST /cart/item`, `GET /cart/{userId}`, `DELETE /cart/{userId}/items/{cartItemId}`, `POST /cart/checkout-item` |
| Rent | `GET /listings/rent`, `POST /listings/rent`, `POST /rent` |
| Payments | `POST /payments`, `GET /payments`, `PATCH /payments/{id}/status`, `DELETE /payments/{id}` |
| Support | `POST /tickets`, `GET /tickets`, `GET /tickets/{ticketId}`, `POST /tickets/{ticketId}/attachments` |
| Admin | `GET /admin/users`, `PATCH /admin/users/{userId}/role`, `GET /admin/deletion-requests`, `POST /admin/instant-prices`, `GET /admin/tickets` |

## Структура проекта

```text
CS-Market/
  backend/
    src/main/java/ru/itmo/backend/
      config/        CORS, проверка подключения к базе данных
      controller/    REST API controllers
      dao/           JDBC-вызовы database functions/procedures
      dto/           request/response DTOs
      exception/     модель API-ошибки и обработка исключений
      jobs/          плановая очистка резервов
      mapper/        маппинг entity -> DTO
      model/         JPA entities и enums
      repository/    Spring Data repositories
      service/       бизнес-логика
    src/main/resources/
      application.yml
  frontend/
    src/
      auth/          auth context, token storage, auth API
      components/    общие UI-компоненты
      layout/        оболочка приложения и навигация
      pages/         market, cart, inventory, rent, payments, support, admin
      api.ts         типизированная fetch-обертка
  docs/
    report.pdf
    uml.svg
    uml/
```

## Локальный запуск

### Требования

- JDK 17+
- Node.js 20+
- PostgreSQL
- npm

### База данных

Backend использует PostgreSQL и при старте проверяет существующую схему:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/csmark
    username: postgres
    password: 1111
  jpa:
    hibernate:
      ddl-auto: validate
```

Перед запуском backend нужно создать базу `csmark` и применить необходимые таблицы, функции и процедуры. В текущем репозитории SQL-миграции не включены, поэтому локальная база должна уже соответствовать JPA-моделям и вызовам stored procedures.

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API запускается на `http://localhost:8080`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Укажите API URL в `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Запустите frontend:

```powershell
npm run dev
```

Приложение запускается на `http://localhost:5173`.

## Полезные команды

```powershell
# тесты backend
cd backend
.\mvnw.cmd test

# проверки frontend
cd frontend
npm run lint
npm run build
```

## Планируемые улучшения

- Добавить импорт Steam inventory, чтобы скины и предметы инвентаря синхронизировались из внешних данных.
- Добавить Flyway или Liquibase migrations для воспроизводимой настройки базы данных.
- Расширить автоматические тесты для сценариев покупки, аренды и платежей.

## Авторы

- [wrakelft](https://github.com/wrakelft)
- [kkkeri](https://github.com/kkkeri)

## Лицензия

Проект распространяется по лицензии MIT. Подробности в [`LICENSE`](LICENSE).
