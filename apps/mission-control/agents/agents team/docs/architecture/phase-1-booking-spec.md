# Beauty CRM — Phase 1: Booking MVP — Technical Specification

## 1. DB Schema (PostgreSQL / Supabase)

### shops
```sql
CREATE TABLE shops (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    address         TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    logo_url        TEXT,
    timezone        VARCHAR(50)     NOT NULL DEFAULT 'Asia/Jerusalem',
    slot_interval   SMALLINT        NOT NULL DEFAULT 30,
    buffer_minutes  SMALLINT        NOT NULL DEFAULT 0,
    working_hours   JSONB           NOT NULL DEFAULT '{}'::jsonb,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'ILS',
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_shops_slug ON shops (slug) WHERE is_active = true;
```

### services
```sql
CREATE TABLE services (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID            NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    category        VARCHAR(100),
    duration_min    SMALLINT        NOT NULL CHECK (duration_min > 0),
    price           NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    sort_order      SMALLINT        NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_services_shop ON services (shop_id) WHERE is_active = true;
```

### masters
```sql
CREATE TABLE masters (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID            NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    bio             TEXT,
    photo_url       TEXT,
    specialization  VARCHAR(255),
    rating          NUMERIC(2, 1)   DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    sort_order      SMALLINT        NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_masters_shop ON masters (shop_id) WHERE is_active = true;
```

### master_services
```sql
CREATE TABLE master_services (
    master_id       UUID            NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    service_id      UUID            NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    custom_duration SMALLINT,
    custom_price    NUMERIC(10, 2),
    PRIMARY KEY (master_id, service_id)
);
```

### schedules
```sql
CREATE TABLE schedules (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id       UUID            NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    day_of_week     SMALLINT        NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    is_working      BOOLEAN         NOT NULL DEFAULT true,
    CONSTRAINT chk_schedule_times CHECK (start_time < end_time),
    CONSTRAINT uq_schedule_master_day UNIQUE (master_id, day_of_week)
);
```

### schedule_overrides
```sql
CREATE TABLE schedule_overrides (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id       UUID            NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    override_date   DATE            NOT NULL,
    is_working      BOOLEAN         NOT NULL DEFAULT false,
    start_time      TIME,
    end_time        TIME,
    CONSTRAINT uq_override_master_date UNIQUE (master_id, override_date)
);
```

### bookings
```sql
CREATE TYPE booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','no_show');

CREATE TABLE bookings (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID            NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    master_id       UUID            NOT NULL REFERENCES masters(id) ON DELETE RESTRICT,
    service_id      UUID            NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    client_name     VARCHAR(255)    NOT NULL,
    client_phone    VARCHAR(20)     NOT NULL,
    client_email    VARCHAR(255),
    start_at        TIMESTAMPTZ     NOT NULL,
    end_at          TIMESTAMPTZ     NOT NULL,
    status          booking_status  NOT NULL DEFAULT 'pending',
    price           NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    notes           TEXT,
    version         INTEGER         NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    CONSTRAINT chk_booking_times CHECK (start_at < end_at)
);

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE bookings ADD CONSTRAINT excl_booking_overlap
    EXCLUDE USING gist (master_id WITH =, tstzrange(start_at, end_at) WITH &&)
    WHERE (status NOT IN ('cancelled', 'no_show'));

CREATE INDEX idx_bookings_master_time ON bookings (master_id, start_at, end_at) WHERE status NOT IN ('cancelled', 'no_show');
CREATE INDEX idx_bookings_shop_date ON bookings (shop_id, start_at) WHERE status NOT IN ('cancelled', 'no_show');
```

## 2. API Contracts

### GET /api/v1/shops/:slug
Returns shop info. 404 if not found.

### GET /api/v1/shops/:shopId/services
Returns services grouped by category. Query: ?category=

### GET /api/v1/shops/:shopId/masters
Returns masters. Query: ?serviceId= filters by service.

### GET /api/v1/availability
Query: masterId, serviceId, date (YYYY-MM-DD). Returns array of {start, end, available} slots.

### POST /api/v1/bookings
Body: {shop_id, master_id, service_id, start_at, client_name, client_phone, client_email?, notes?}
Returns 201 with booking. 409 on conflict.

### GET /api/v1/admin/bookings
Query: shopId, date, dateFrom, dateTo, status, masterId, page, limit. Paginated.

### PATCH /api/v1/admin/bookings/:id
Body: {status?, notes?, start_at?, master_id?, version}. Optimistic locking.

## 3. Key Decisions
- Slot algorithm: generate grid from schedule, exclude occupied ranges
- Conflict prevention: PostgreSQL exclusion constraint (primary) + optimistic locking (PATCH)
- Timezone: store UTC, display in shop timezone (IANA), never hardcode offset
- schedule_overrides table for holidays/vacations
