# EC02 — Sistema de Gestão de Funcionários

Arquivos principais:
- index.html
- app.js
- Dockerfile
- docker-compose.yml

## Como rodar local com Docker
```bash

docker build -t devtech-academy:local .
docker run --rm -p 8080:80 devtech-academy:local
# Abra http://localhost:8080

docker compose up --build
# abra http://localhost:8080
