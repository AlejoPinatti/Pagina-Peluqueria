-- Eliminar la columna email de la tabla turnos
ALTER TABLE turnos DROP COLUMN IF EXISTS email;

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'turnos' 
ORDER BY ordinal_position;
