# EC03 - Cinema

## Como rodar local com Docker
```bash

docker build -t ec03-cinema .
docker compose up --build
# ou
docker run -d -p 8083:80 ec03-cinema
# abra http://localhost:8083