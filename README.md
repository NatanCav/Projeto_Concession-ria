# Concessionária — Catálogo de Veículos

> ⚠️ Projeto em desenvolvimento ativo. Este README é atualizado a cada etapa concluída.

Sistema web completo para uma concessionária de veículos divulgar seu estoque: catálogo público
com busca/filtros/ordenação, página de detalhes com galeria e ficha técnica, contato direto via
WhatsApp com mensagem automática, e um painel administrativo protegido para gerenciar veículos,
marcas, categorias, usuários e as configurações da concessionária.

O layout/fluxo usa como referência apenas o comportamento de sites de concessionária em geral —
todo o código, textos e identidade visual são autorais.

## Sumário

- [Objetivo](#objetivo)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Migrations e dados de exemplo](#migrations-e-dados-de-exemplo)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Deploy](#deploy)

## Objetivo

Permitir que uma concessionária publique seu estoque de veículos (carros e motos) e que
visitantes pesquisem, filtrem, vejam detalhes completos e iniciem contato via WhatsApp já
com a mensagem preenchida indicando o veículo de interesse. Um painel administrativo permite
gerenciar todo o conteúdo sem depender de deploy manual.

## Stack

**Backend:** Java 21 · Spring Boot 3 (Web, Data JPA, Security, Validation) · PostgreSQL ·
Flyway · JWT (jjwt) · springdoc-openapi (Swagger) · JUnit 5 + Mockito + Testcontainers.

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · React Router · TanStack Query ·
React Hook Form + Zod · Axios · Vitest + Testing Library.

**Infra:** Docker / Docker Compose (PostgreSQL sempre ativo; backend/frontend/nginx sob o
profile `full`).

## Arquitetura

Monorepo com backend e frontend desacoplados, comunicando-se via API REST/JSON:

```
[React SPA] ──HTTP/JSON──> [Spring Boot API] ──JDBC──> [PostgreSQL]
                                   │
                                   └── arquivos estáticos (fotos dos veículos)
```

O backend segue organização por *feature* (cada domínio — `vehicle`, `brand`, `category`,
`user`, `auth`, `settings`, `lead` — concentra entidade, repositório, service, controller e
DTOs), com camadas transversais em `config`, `security`, `common` e `exception`. Upload de
imagens passa por uma interface `FileStorageService`, implementada localmente em desenvolvimento
e substituível por S3/Cloudinary sem alterar o restante da aplicação.

## Estrutura de pastas

```
ProjetoConcessionária/
├── docker-compose.yml
├── .env.example
├── backend/            # API Spring Boot (Maven)
│   ├── src/main/java/com/concessionaria/...
│   └── src/main/resources/db/migration/  # migrations Flyway
└── frontend/           # SPA React + Vite + TypeScript
    └── src/
```

## Como rodar localmente

Pré-requisitos: Docker + Docker Compose, JDK 21, Maven (ou `./mvnw`), Node.js 20+.

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
# edite .env com valores próprios (senha do banco, JWT_SECRET, admin de dev)

# 2. Subir o PostgreSQL
docker compose up -d postgres

# 3. Backend (aplica as migrations Flyway automaticamente ao iniciar)
cd backend
./mvnw spring-boot:run

# 4. Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:5173

## Variáveis de ambiente

Veja [`.env.example`](.env.example) para a lista completa. Nenhuma credencial real é
versionada; o usuário administrador de desenvolvimento é criado a partir de
`APP_ADMIN_EMAIL`/`APP_ADMIN_PASSWORD` por um seeder que só roda no profile `dev`.

## Migrations e dados de exemplo

O schema é 100% controlado por migrations Flyway (`backend/src/main/resources/db/migration`),
com `spring.jpa.hibernate.ddl-auto=validate` — o Hibernate nunca altera o schema em runtime.
Dados de demonstração (marcas, categorias, ~12 veículos com fotos e ficha técnica, e o usuário
admin) são inseridos por um `CommandLineRunner` ativo apenas no profile `dev`.

## Endpoints da API

Lista completa e testável via Swagger UI. Principais grupos: `/api/auth`, `/api/vehicles`,
`/api/vehicles/{id}/images`, `/api/brands`, `/api/categories`, `/api/users`, `/api/settings`,
`/api/leads`, `/api/admin/dashboard`.

## Testes

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm run test
```

## Deploy

_Seção detalhada ao final do desenvolvimento (etapa 8)._

---

### Status do desenvolvimento

- [x] Etapa 1 — estrutura de pastas, Docker Compose, variáveis de ambiente, README inicial
- [ ] Etapa 2 — backend base (Postgres, Flyway, entidades, repositórios, services, controllers)
- [ ] Etapa 3 — Spring Security + JWT + roles + login
- [ ] Etapa 4 — CRUD completo de veículos, imagens, ficha técnica, seed de dev
- [ ] Etapa 5 — frontend público (home, catálogo, detalhes, WhatsApp)
- [ ] Etapa 6 — painel administrativo
- [ ] Etapa 7 — responsividade, SEO, performance
- [ ] Etapa 8 — testes, revisão final e documentação de deploy
