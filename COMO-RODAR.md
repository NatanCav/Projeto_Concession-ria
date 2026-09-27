# Como rodar o projeto (Fedora e Windows 11)

## Pré-requisitos

| | Fedora | Windows 11 |
|---|---|---|
| Java | **JDK 21** (`sudo dnf install java-21-openjdk-devel`) | **JDK 21** (ex.: Temurin 21) com `JAVA_HOME` apontando para ele |
| Node | 20 ou mais recente | 20 ou mais recente |
| Docker | Docker Engine rodando | **Docker Desktop aberto** |

## 1. Arquivo `.env` (só na primeira vez)

Na raiz do projeto, **crie o `.env` apenas se ele ainda não existir**. Copiar o exemplo por cima de um `.env` existente apaga as suas configurações.

- **Fedora:** `[ -f .env ] || cp .env.example .env`
- **Windows (PowerShell):** `if (!(Test-Path .env)) { Copy-Item .env.example .env }`

Num `.env` novo, troque os valores `change-me` e gere um `JWT_SECRET` forte (`openssl rand -base64 48`).

## 2. Backend (API na porta 8080)

O script carrega o `.env`, sobe o Postgres no Docker, compila e inicia a API. Na primeira execução, as migrations criam as tabelas e o administrador inicial.

**Fedora:**

```bash
cd backend
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk   # necessário se o java padrão da máquina não for o 21
./run.sh
```

**Windows (PowerShell):**

```powershell
cd backend
.\run.ps1
```

Se o PowerShell bloquear o script: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Opções: `--skip-build` / `-SkipBuild` usa o jar já compilado, e `--skip-postgres` / `-SkipPostgres` não mexe no Docker.

## 3. Frontend (site na porta 5173)

Em outro terminal, igual nos dois sistemas:

```bash
cd frontend
npm install     # só na primeira vez ou quando mudarem as dependências
npm run dev
```

## 4. Acessar

- **Site:** http://localhost:5173
- **Página de uma loja:** http://localhost:5173/lojas/1
- **Painel:** http://localhost:5173/admin/login
  - **Admin:** `admin@concessionaria.com`. A senha inicial é repassada separadamente; troque-a no primeiro login, em Usuários.
  - **Vendedores:** o admin cria em Usuários → Novo usuário → perfil Vendedor → escolhe a loja. Cada vendedor só enxerga a própria loja.

---

## Porta já em uso: o que fazer

### Descobrir quem está usando a porta

| | Fedora | Windows (PowerShell) |
|---|---|---|
| Processo na porta | `ss -ltnp \| grep :8080` | `Get-NetTCPConnection -LocalPort 8080 \| Select OwningProcess` |
| Container na porta | `docker ps --format '{{.Names}} {{.Ports}}'` | o mesmo comando |
| Encerrar o processo | `kill <PID>` | `Stop-Process -Id <PID>` |
| Parar um container | `docker stop <nome>` | o mesmo comando |

Se o processo for uma execução antiga deste projeto, é só encerrá-lo. Se for de outro projeto, troque a porta daqui, como abaixo.

### Postgres (5432): erro `port is already allocated`

No `.env`, mude **as duas linhas juntas** para a mesma porta livre (ex.: 5433):

```
POSTGRES_PORT=5433
DATABASE_URL=jdbc:postgresql://localhost:5433/concessionaria
```

Depois rode o script de novo.

### Backend (8080): erro `Port 8080 was already in use`

1. No `.env`, altere `SERVER_PORT=8081`.
2. Crie o arquivo `frontend/.env.local` com:

   ```
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

3. Reinicie o backend e o frontend.

### Frontend (5173)

Se a 5173 estiver ocupada, o Vite sobe sozinho em outra porta (5174, por exemplo), mas o backend só aceita requisições da origem configurada. Resolva de um destes jeitos:

- libere a 5173, **ou**
- no `.env`, deixe `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174` e reinicie o backend.

### Outros erros comuns

| Mensagem | Causa e solução |
|---|---|
| `release version 21 not supported` | O Maven está usando o Java errado. Aponte o `JAVA_HOME` para o JDK 21. |
| `Could not resolve placeholder 'JWT_SECRET'` | O backend foi iniciado com `./mvnw spring-boot:run` direto, sem o script. Use o `run.sh` ou o `run.ps1`, que carregam o `.env`. |
| `password authentication failed` | A senha do `.env` não bate com a do banco, ou o backend está conectando no Postgres de outro projeto. Confira a porta no `DATABASE_URL`. |
