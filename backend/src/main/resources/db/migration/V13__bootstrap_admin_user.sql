-- One-off: cria o primeiro administrador para que um banco novo (produção) seja acessível.
-- A senha inicial foi entregue fora do repositório; troque-a logo no primeiro login (Painel > Usuários).
INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
VALUES ('Administrador',
        'admin@concessionaria.com',
        '$2b$10$LQ0PBFp9xlkWWGqZjDuAm.g/EsyWe.w1aUZbYcUN5OC.m.LDnCtlK',
        'ADMIN',
        TRUE,
        NOW(),
        NOW())
ON CONFLICT (email) DO NOTHING;
