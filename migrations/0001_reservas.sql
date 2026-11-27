-- Reservas de Gitano Studio. Horas locales de Mérida (UTC-6, sin horario de verano),
-- guardadas como texto 'YYYY-MM-DDTHH:MM' para comparar y ordenar sin conversiones.

CREATE TABLE services (
  id        TEXT PRIMARY KEY,
  grp       TEXT NOT NULL,
  name      TEXT NOT NULL,
  note      TEXT,
  price     INTEGER NOT NULL,          -- MXN
  duration  INTEGER NOT NULL,          -- minutos
  active    INTEGER NOT NULL DEFAULT 1,
  sort      INTEGER NOT NULL DEFAULT 0
);

-- Horario semanal. 0 = domingo … 6 = sábado. Sin fila = cerrado.
CREATE TABLE hours (
  dow        INTEGER PRIMARY KEY,
  open_min   INTEGER NOT NULL,         -- minutos desde 00:00
  close_min  INTEGER NOT NULL
);

-- Horarios bloqueados (almuerzo, vacaciones, un trámite).
CREATE TABLE blocks (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  start_at  TEXT NOT NULL,
  end_at    TEXT NOT NULL,
  reason    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX blocks_range ON blocks (start_at, end_at);

CREATE TABLE bookings (
  id          TEXT PRIMARY KEY,
  token       TEXT NOT NULL UNIQUE,    -- link privado del cliente para ver o cancelar
  service_id  TEXT NOT NULL REFERENCES services(id),
  service_name TEXT NOT NULL,          -- copia: si cambia el servicio, el turno no cambia
  price       INTEGER NOT NULL,
  start_at    TEXT NOT NULL,
  end_at      TEXT NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'confirmada', -- confirmada | atendida | no_vino | cancelada
  source      TEXT NOT NULL DEFAULT 'web',        -- web | panel
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  cancelled_at TEXT
);
CREATE INDEX bookings_start ON bookings (start_at);
CREATE INDEX bookings_phone ON bookings (phone);

-- Servicios y precios actuales del sitio. Duraciones a confirmar con Dayner.
INSERT INTO services (id, grp, name, note, price, duration, sort) VALUES
  ('corte',       'Corte',     'Corte personalizado',          'Asesoría, corte y acabado pensados para tu cabeza.', 350, 45, 1),
  ('tijera',      'Corte',     'Corte especializado a tijera', 'Todo a tijera: textura y movimiento.',               400, 60, 2),
  ('femenino',    'Corte',     'Corte corto femenino',         'Cortes cortos de mujer con forma y textura.',        450, 60, 3),
  ('barba',       'Barba',     'Diseño y arreglo de barba',    'Forma, perfilado a navaja y acabado.',               250, 30, 4),
  ('ritual',      'Barba',     'Ritual con toalla caliente',   'Toalla caliente y navaja, al ras.',                  150, 30, 5),
  ('corte-barba', 'Completos', 'Corte y barba',                'Cabello y barba en una sola cita.',                  500, 60, 6),
  ('experiencia', 'Completos', 'Experiencia Gitano',           'Corte, barba, toalla caliente y facial exprés.',     650, 90, 7),
  ('facial',      'Detalles',  'Tratamiento facial exprés',    'Un facial rápido para que la piel salga fresca.',    180, 20, 8),
  ('cejas',       'Detalles',  'Diseño de cejas',              'Cejas definidas, sin que se note.',                   80, 15, 9);

-- Mar–Sáb 10:00–19:30 · Dom 12:00–18:00 · Lunes cerrado.
INSERT INTO hours (dow, open_min, close_min) VALUES
  (0, 720, 1080),
  (2, 600, 1170), (3, 600, 1170), (4, 600, 1170), (5, 600, 1170), (6, 600, 1170);
