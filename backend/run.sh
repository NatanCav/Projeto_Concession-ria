#!/usr/bin/env bash
# Sobe o Postgres (se necessário), builda e roda o backend localmente,
# carregando as variáveis de ambiente do ".env" na raiz do projeto.
#
# Uso:
#   ./run.sh                 build + run
#   ./run.sh --skip-build    roda direto o jar que já existe em target/
#   ./run.sh --skip-postgres não tenta subir o container do Postgres via docker compose

set -euo pipefail

SKIP_BUILD=false
SKIP_POSTGRES=false
for arg in "$@"; do
    case "$arg" in
        --skip-build) SKIP_BUILD=true ;;
        --skip-postgres) SKIP_POSTGRES=true ;;
        *) echo "Argumento desconhecido: $arg" >&2; exit 1 ;;
    esac
done

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$BACKEND_DIR")"
ENV_FILE="$ROOT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "Arquivo .env não encontrado em '$ROOT_DIR'. Copie .env.example para .env e ajuste os valores antes de continuar." >&2
    exit 1
fi

echo "Carregando variáveis de $ENV_FILE..."
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ "$SKIP_POSTGRES" == false ]]; then
    echo "Subindo o Postgres (docker compose up -d postgres)..."
    (cd "$ROOT_DIR" && docker compose up -d postgres) || \
        echo "Aviso: não foi possível subir o Postgres via Docker. Verifique se o Docker está rodando." >&2
fi

cd "$BACKEND_DIR"

if [[ "$SKIP_BUILD" == false ]]; then
    echo "Compilando o backend (mvnw package -DskipTests)..."
    ./mvnw -q package -DskipTests
fi

JAR="$BACKEND_DIR/target/concessionaria-api.jar"
if [[ ! -f "$JAR" ]]; then
    echo "Jar não encontrado em target/. Rode sem --skip-build na primeira vez." >&2
    exit 1
fi

echo "Iniciando o backend..."
java -jar "$JAR"
