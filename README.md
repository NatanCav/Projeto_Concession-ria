# Concessionária — Catálogo de Veículos

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
- [Docker](#docker)
- [Segurança](#segurança)
- [Deploy](#deploy)
- [Limitações conhecidas](#limitações-conhecidas)

## Objetivo

Permitir que uma concessionária publique seu estoque de veículos (carros, motos e caminhões) e
que visitantes pesquisem, filtrem, vejam detalhes completos e iniciem contato via WhatsApp já
com a mensagem preenchida indicando o veículo de interesse. Um painel administrativo permite
gerenciar todo o conteúdo (veículos, fotos, marcas, categorias, usuários, dados da concessionária)
sem depender de deploy manual.

## Stack

**Backend:** Java 21 · Spring Boot 3.3 (Web, Data JPA, Security, Validation) · PostgreSQL 16 ·
Flyway · JWT (jjwt) · BCrypt · springdoc-openapi (Swagger) · JUnit 5 + Mockito + MockMvc +
Testcontainers.

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · React Router 7 · TanStack Query ·
React Hook Form + Zod · Axios · Radix UI · sonner (toasts) · Vitest + Testing Library + MSW.

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
`user`, `auth`, `settings`, `lead`, `seo` — concentra entidade, repositório, service, controller
e DTOs), com camadas transversais em `config`, `security`, `common` e `exception`. Upload de
imagens passa por uma interface `FileStorageService`, implementada localmente em desenvolvimento
e substituível por S3/Cloudinary sem alterar o restante da aplicação.

O frontend é uma SPA puramente client-side (sem SSR) — o `useDocumentMeta` atualiza título e
meta tags por página no navegador, o que cobre a aba/preview social mas não é visível a crawlers
que não executam JavaScript. Ver [Limitações conhecidas](#limitações-conhecidas).

## Estrutura de pastas

```
ProjetoConcessionária/
├── docker-compose.yml
├── .env.example
├── backend/                # API Spring Boot (Maven)
│   ├── Dockerfile
│   ├── src/main/java/com/concessionaria/
│   │   ├── auth/ brand/ category/ vehicle/ user/ settings/ lead/ dashboard/ seo/
│   │   ├── config/ security/ storage/ exception/ common/
│   │   └── seed/DataSeeder.java     # dados de demonstração (profile "dev")
│   ├── src/main/resources/db/migration/  # migrations Flyway (V1..V8)
│   └── src/test/java/...           # testes unitários, @WebMvcTest, Testcontainers
└── frontend/                # SPA React + Vite + TypeScript
    ├── Dockerfile / nginx.conf
    ├── public/              # favicon, robots.txt
    └── src/
        ├── pages/ (públicas e admin/)
        ├── components/ (layout/ vehicle/ catalog/ ui/ admin/)
        ├── hooks/ services/ context/ types/ utils/
        └── tests/ (setup, mocks MSW, test-utils)
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
- Login de dev: e-mail/senha definidos em `APP_ADMIN_EMAIL`/`APP_ADMIN_PASSWORD` no `.env`

> Se a porta 5432 já estiver em uso por outro Postgres na sua máquina, ajuste `POSTGRES_PORT`
> e `DATABASE_URL` no `.env` (ex.: `5433`) — não é necessário parar o outro serviço.

### Rodando tudo via Docker (sem instalar Node/JDK localmente)

```bash
cp .env.example .env
docker compose --profile full up --build
```

Sobe Postgres + backend (porta 8080) + frontend já buildado e servido por nginx (porta 5173).

## Variáveis de ambiente

Veja [`.env.example`](.env.example) para a lista completa. Nenhuma credencial real é
versionada; o usuário administrador de desenvolvimento é criado a partir de
`APP_ADMIN_EMAIL`/`APP_ADMIN_PASSWORD` por um seeder que só roda no profile `dev`.
`PUBLIC_SITE_URL` define o domínio usado para montar as URLs absolutas do `sitemap.xml`.

## Migrations e dados de exemplo

O schema é 100% controlado por migrations Flyway (`backend/src/main/resources/db/migration`),
com `spring.jpa.hibernate.ddl-auto=validate` — o Hibernate nunca altera o schema em runtime.
Dados de demonstração (8 marcas, 6 categorias, 13 veículos com fotos e ficha técnica, e o
usuário admin) são inseridos por um `CommandLineRunner` (`DataSeeder`) ativo apenas no profile
`dev`, e é idempotente — não duplica dados em reinicializações.

## Endpoints da API

Documentação interativa completa via Swagger UI (`/swagger-ui.html`). Principais grupos:

| Recurso | Endpoints | Acesso |
|---|---|---|
| Autenticação | `POST /api/auth/login`, `GET /api/auth/me` | público / autenticado |
| Veículos (público) | `GET /api/vehicles`, `GET /api/vehicles/slug/{slug}`, `GET /api/vehicles/featured`, `GET /api/vehicles/recent`, `GET /api/vehicles/{id}/related` | público |
| Veículos (admin) | `GET /api/vehicles/admin`, `GET /api/vehicles/{id}`, `POST /api/vehicles`, `PUT /api/vehicles/{id}`, `DELETE /api/vehicles/{id}`, `PATCH /api/vehicles/{id}/status`, `PATCH /api/vehicles/{id}/featured`, `PUT /api/vehicles/{id}/specifications` | ADMIN / VENDEDOR |
| Fotos do veículo | `POST/PATCH/DELETE /api/vehicles/{id}/images/**` | ADMIN / VENDEDOR |
| Marcas | `GET /api/brands` (público) · `POST/PUT/DELETE` (ADMIN) | misto |
| Categorias | `GET /api/categories` (público) · `POST/PUT/DELETE` (ADMIN) | misto |
| Usuários | `GET/POST/PUT/DELETE /api/users`, `PATCH /api/users/{id}/status` | ADMIN |
| Configurações | `GET /api/settings` (público) · `PUT /api/settings` (ADMIN) | misto |
| Interesses (leads) | `POST /api/leads` | público |
| Dashboard | `GET /api/admin/dashboard/summary` | ADMIN / VENDEDOR |
| SEO | `GET /sitemap.xml` | público |
| Arquivos | `GET /uploads/**` | público |

## Testes

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm run test
```

**Backend** (62 testes): regras de negócio dos services (slug, filtros, status, destaque,
autenticação, CRUD de usuários) com JUnit 5 + Mockito; autorização por role e validação de DTO
nos controllers com `@WebMvcTest` + MockMvc; filtros/paginação do repositório contra PostgreSQL
real com Testcontainers (`VehicleRepositoryTest` — requer Docker acessível a partir do processo
que roda os testes; não executa dentro de ambientes onde o Docker só é alcançável via socket
montado em outro container, ex.: Docker-in-Docker aninhado no Windows).

**Frontend** (14 testes): `VehicleCard`, `FilterSidebar` (com API mockada via MSW), fluxo do
`Catalog` (sucesso/vazio/erro), validação e erro de login do `AdminLogin`, redirecionamento e
controle de acesso por role do `ProtectedRoute`.

## Docker

`docker-compose.yml` define:
- `postgres` — sempre ativo, porta configurável via `POSTGRES_PORT`.
- `backend` / `frontend` — sob o profile `full` (`docker compose --profile full up --build`),
  com `Dockerfile` próprio em cada pasta. O frontend é servido por nginx (`frontend/nginx.conf`),
  com fallback de rotas para `index.html` (necessário para o React Router) e cache agressivo
  para assets com hash no nome.

No dia a dia de desenvolvimento normalmente só o Postgres roda em Docker; backend e frontend
rodam localmente (`mvnw spring-boot:run` / `npm run dev`) para reload mais rápido.

## Segurança

Spring Security stateless + JWT (HS384, `jjwt`), senhas com BCrypt, autorização por role
(`ADMIN`/`VENDEDOR`) via `@PreAuthorize` em cada endpoint sensível, CORS restrito à origem do
frontend, CSRF desabilitado (API stateless), validação de entrada em todos os DTOs, tratamento
de erros consistente via `GlobalExceptionHandler`. Nenhuma credencial fica no código-fonte.

Dependências de produção do frontend (`react-router-dom`, `react`, `axios`, etc.) são mantidas
livres de vulnerabilidades conhecidas (`npm audit`). As vulnerabilidades remanescentes reportadas
pelo `npm audit` afetam apenas o servidor de desenvolvimento do Vite/Vitest (`esbuild`,
`vite`, `vitest`) — nunca chegam ao bundle de produção — e não foram corrigidas via upgrade
major para evitar quebrar a toolchain de build sem necessidade real de segurança.

## Deploy

Backend e frontend são deployáveis de forma independente:

**Backend (API + PostgreSQL):**
1. Provisione um PostgreSQL gerenciado (Railway, Render, Neon, RDS, etc.) ou use o
   `docker-compose.yml` num VPS.
2. Faça o build da imagem: `docker build -t concessionaria-api ./backend` (ou deixe a
   plataforma buildar a partir do `Dockerfile`).
3. Configure as variáveis de ambiente de produção (ver `.env.example`): `DATABASE_URL`,
   `JWT_SECRET` (gerado com `openssl rand -base64 48`), `SPRING_PROFILES_ACTIVE=prod`
   (desativa o seeder de dados de teste), `CORS_ALLOWED_ORIGINS` com o domínio real do
   frontend, `PUBLIC_SITE_URL` com o domínio público do site.
4. As migrations Flyway rodam automaticamente no start-up; não é necessário nenhum passo manual.
5. Crie o primeiro usuário ADMIN diretamente no banco (hash BCrypt) ou execute uma vez com
   `SPRING_PROFILES_ACTIVE=dev` + `APP_ADMIN_EMAIL`/`APP_ADMIN_PASSWORD` definidos para deixar
   o seeder criá-lo, depois volte para `prod`.

**Frontend:** o `Dockerfile` gera uma imagem nginx com o build estático — pode ser publicada em
qualquer plataforma que rode containers, ou o conteúdo de `npm run build` (pasta `dist/`) pode
ser hospedado diretamente em Vercel/Netlify/Cloudflare Pages, apontando `VITE_API_BASE_URL` para
a URL pública do backend.

**Roteamento de `/sitemap.xml`:** como o sitemap é gerado dinamicamente pelo backend (para
refletir o estoque real), em produção configure o proxy/CDN do domínio público para rotear
`GET /sitemap.xml` (e opcionalmente `/robots.txt`, já servido estaticamente pelo frontend) para
o backend, caso frontend e backend fiquem em domínios/subpaths diferentes.

## Limitações conhecidas

- **SEO client-side apenas:** a aplicação é uma SPA sem SSR; `useDocumentMeta` atualiza título e
  meta tags no navegador (cobre preview de redes sociais quando o crawler executa JS), mas
  crawlers que não executam JavaScript veem apenas o HTML inicial. O `sitemap.xml` dinâmico e o
  `robots.txt` já ajudam na indexação básica.
- **Teste de repositório com Testcontainers:** funciona em CI (GitHub Actions, GitLab CI) e em
  máquinas Linux/Docker Desktop nativos, mas não roda dentro de um ambiente onde o próprio
  processo Maven já está containerizado e só enxerga o Docker via socket montado (limitação do
  Docker Desktop para Windows nesse cenário específico, não do código).

---

### Status do desenvolvimento

- [x] Etapa 1 — estrutura de pastas, Docker Compose, variáveis de ambiente
- [x] Etapa 2 — backend base (Postgres, Flyway, entidades, repositórios, services, controllers)
- [x] Etapa 3 — Spring Security + JWT + roles + login
- [x] Etapa 4 — CRUD completo de veículos, imagens, ficha técnica, seed de dev
- [x] Etapa 5 — frontend público (home, catálogo, detalhes, WhatsApp)
- [x] Etapa 6 — painel administrativo
- [x] Etapa 7 — responsividade, SEO (meta tags, sitemap, robots.txt), performance
- [x] Etapa 8 — testes (62 backend + 14 frontend), Docker completo, documentação, segurança
