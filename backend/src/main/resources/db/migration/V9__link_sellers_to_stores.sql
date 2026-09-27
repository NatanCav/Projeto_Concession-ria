-- Cada vendedor pertence a uma loja (marca). Administradores ficam com brand_id nulo.
ALTER TABLE users ADD COLUMN brand_id BIGINT REFERENCES brands (id);

CREATE INDEX idx_users_brand_id ON users (brand_id);
