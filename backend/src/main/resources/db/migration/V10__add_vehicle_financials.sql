ALTER TABLE vehicles
    ADD COLUMN cost_price NUMERIC(12, 2),
    ADD COLUMN sold_price NUMERIC(12, 2),
    ADD COLUMN sold_at    TIMESTAMPTZ;

ALTER TABLE vehicles
    ADD CONSTRAINT chk_vehicles_cost_price_non_negative CHECK (cost_price IS NULL OR cost_price >= 0),
    ADD CONSTRAINT chk_vehicles_sold_price_non_negative CHECK (sold_price IS NULL OR sold_price >= 0);

-- Veículos já vendidos antes desta migration assumem o preço anunciado como valor de venda.
UPDATE vehicles
SET sold_price = COALESCE(promotional_price, price),
    sold_at    = updated_at
WHERE status = 'VENDIDO';

CREATE INDEX idx_vehicles_sold_at ON vehicles (sold_at);
