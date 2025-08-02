-- Crear tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  servicio TEXT NOT NULL,
  comentarios TEXT,
  confirmado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_hora ON turnos(fecha, hora);

-- Habilitar Row Level Security (opcional)
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations on turnos" ON turnos
FOR ALL USING (true);
