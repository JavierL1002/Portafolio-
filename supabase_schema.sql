-- =====================================================
-- ESQUEMA SQL COMPLETO PARA SUPABASE
-- Finance Tracker - Gestor de Portafolio de Criptomonedas
-- =====================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    open_id VARCHAR(64) NOT NULL UNIQUE,
    name TEXT,
    email VARCHAR(320),
    login_method VARCHAR(64),
    role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_signed_in TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_open_id ON users(open_id);

-- Tabla de tasas de cambio históricas
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    tasa_oficial DECIMAL(10, 4),
    tasa_paralelo DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_fecha ON exchange_rates(fecha);

-- Tabla de criptomonedas
CREATE TABLE IF NOT EXISTS cryptocurrencies (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_symbol ON cryptocurrencies(symbol);

-- Tabla de compras de criptomonedas
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crypto_id INTEGER NOT NULL REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
    cantidad DECIMAL(20, 8) NOT NULL,
    precio_unitario DECIMAL(20, 8) NOT NULL,
    fecha_compra DATE NOT NULL,
    tasa_oficial_fecha DECIMAL(10, 4),
    tasa_paralelo_fecha DECIMAL(10, 4),
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_crypto_id ON purchases(crypto_id);
CREATE INDEX IF NOT EXISTS idx_purchases_fecha_compra ON purchases(fecha_compra);

-- Insertar criptomonedas populares por defecto
INSERT INTO cryptocurrencies (symbol, name) VALUES
    ('BTC', 'Bitcoin'),
    ('ETH', 'Ethereum'),
    ('USDT', 'Tether'),
    ('BNB', 'Binance Coin'),
    ('SOL', 'Solana'),
    ('XRP', 'Ripple'),
    ('ADA', 'Cardano'),
    ('DOGE', 'Dogecoin'),
    ('AVAX', 'Avalanche'),
    ('DOT', 'Polkadot')
ON CONFLICT (symbol) DO NOTHING;

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para obtener portafolio con precios actuales
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
    p.user_id,
    c.symbol,
    c.name,
    SUM(p.cantidad) as total_cantidad,
    AVG(p.precio_unitario) as precio_promedio_compra,
    SUM(p.cantidad * p.precio_unitario) as inversion_total_usd,
    MIN(p.fecha_compra) as primera_compra,
    MAX(p.fecha_compra) as ultima_compra,
    COUNT(*) as numero_compras
FROM purchases p
JOIN cryptocurrencies c ON p.crypto_id = c.id
GROUP BY p.user_id, c.symbol, c.name;

-- Vista para calcular precio promedio de últimas 5 compras por criptomoneda
CREATE OR REPLACE VIEW last_5_purchases_avg AS
WITH ranked_purchases AS (
    SELECT 
        p.*,
        ROW_NUMBER() OVER (PARTITION BY p.user_id, p.crypto_id ORDER BY p.fecha_compra DESC, p.id DESC) as rn
    FROM purchases p
)
SELECT 
    user_id,
    crypto_id,
    AVG(precio_unitario) as precio_promedio_ultimas_5
FROM ranked_purchases
WHERE rn <= 5
GROUP BY user_id, crypto_id;

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE exchange_rates IS 'Tasas de cambio históricas (dólar oficial y paralelo)';
COMMENT ON TABLE cryptocurrencies IS 'Catálogo de criptomonedas soportadas';
COMMENT ON TABLE purchases IS 'Registro de compras de criptomonedas por usuario';
COMMENT ON VIEW portfolio_summary IS 'Resumen del portafolio por usuario y criptomoneda';
COMMENT ON VIEW last_5_purchases_avg IS 'Precio promedio de las últimas 5 compras por usuario y criptomoneda';
