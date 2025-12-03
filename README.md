# Backend Blueprint – AMA BUS Replica for College

## 1. Project purpose
Replica of AMA BUS, adapted for college students (public UI for students; drivers & admins authenticated).

## 2. Backend folder structure
```
backend/
├─ config/
│  ├─ index.js
│  ├─ db.js
│  ├─ redis.js
│  └─ socket.js
├─ migrations/
├─ scripts/
│  ├─ seed.sql
│  └─ migrate.sh
├─ src/
│  ├─ server.js
│  ├─ app.js
│  ├─ controllers/
│  │  ├─ public.controller.js
│  │  ├─ driver.controller.js
│  │  └─ admin.controller.js
│  ├─ services/
│  │  ├─ auth.service.js
│  │  ├─ location.service.js
│  │  └─ eta.service.js
│  ├─ queries/
│  │  ├─ user.queries.js
│  │  ├─ bus.queries.js
│  │  └─ stop.queries.js
│  ├─ middleware/
│  │  ├─ jwtAuth.js
│  │  ├─ apiKeyAuth.js
│  │  └─ validate.js
│  ├─ utils/
│  │  ├─ geo.js
│  │  ├─ logger.js
│  │  └─ crypto.js
│  ├─ routes/
│  │  ├─ public.routes.js
│  │  ├─ driver.routes.js
│  │  └─ admin.routes.js
│  ├─ sockets/
│  │  └─ realtime.js
│  └─ workers/
│     └─ eta.cache.worker.js
├─ tests/
└─ package.json
```

## 3. Responsibilities & exported functions
*(Same content as before—omitted here in summary but included fully earlier)*

## 4. Database schema
```sql
-- users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','driver')),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- drivers
CREATE TABLE drivers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bus_id BIGINT REFERENCES buses(id),
  api_key TEXT UNIQUE NOT NULL,
  api_key_expires TIMESTAMPTZ,
  device_meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- buses
CREATE TABLE buses (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  capacity INT,
  active BOOL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- stops
CREATE TABLE stops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  seq INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- bus_last_locations
CREATE TABLE bus_last_locations (
  bus_id BIGINT PRIMARY KEY REFERENCES buses(id) ON DELETE CASCADE,
  driver_id BIGINT REFERENCES drivers(id),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed_m_s DOUBLE PRECISION,
  heading_deg DOUBLE PRECISION,
  accuracy_m DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- history
CREATE TABLE bus_locations_history (
  id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT REFERENCES buses(id),
  driver_id BIGINT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed_m_s DOUBLE PRECISION,
  heading_deg DOUBLE PRECISION,
  accuracy_m DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 5. API endpoints
*(Full list included earlier)*

## 6. Socket.IO design
- Namespace `/realtime`
- Rooms: `bus:<busId>`, `stop:<stopId>`, `campus:all`
- Events: `subscribe`, `unsubscribe`, `location_update`, `eta_update`, `bus_status`

## 7. Redis design
- `bus:last:<id>` TTL 60s  
- `bus:nearby_stops:<id>` TTL 20s  
- `eta:stop:<stop>:bus:<id>` TTL 20–30s  
- `apikey:<key>` long TTL  
- `dir:cache:<hash>` 15–30s  
- `lock:ingest:bus:<id>` TTL 5s

## 8. ETA algorithm
- Freshness ≤ 25s  
- Near threshold 400–600m  
- Speed ≥ 1.5 m/s  
- Fallback Haversine ETA  
- Google Directions cached 15–30s

## 9. seed.sql suggestion
```sql
INSERT INTO users (name,email,password_hash,role) VALUES
('Admin User','admin@college.edu','$2b$10$examplehashadmin','admin');

INSERT INTO users (name,email,password_hash,role) VALUES
('Driver One','driver1@college.edu','$2b$10$examplehashdriver','driver');

INSERT INTO buses (code,description,capacity) VALUES ('CAMPUS-1','Campus loop',30);

INSERT INTO drivers (user_id,bus_id,api_key,api_key_expires,device_meta)
VALUES (
  (SELECT id FROM users WHERE email='driver1@college.edu'),
  (SELECT id FROM buses WHERE code='CAMPUS-1'),
  'sample-api-key-abcdef123456',
  NULL,
  '{"device":"android-emu"}'
);

INSERT INTO stops (name,lat,lng,seq) VALUES
('Main Gate', 12.9718915, 77.594566, 1),
('Library Stop', 12.9725000, 77.595000, 2),
('Hostel Block A', 12.9732000, 77.594200, 3);
```

## 10. Dev & deploy notes
- `.env` variables required  
- docker-compose with postgres + redis + backend  
- npm scripts: `start`, `dev`, `migrate`, `seed`

## 11. Roadmap
1. DB, migrations, seed  
2. Auth + api_key  
3. Location ingest pipeline  
4. Public endpoints + ETA  
5. Socket system  
6. Admin CRUD
