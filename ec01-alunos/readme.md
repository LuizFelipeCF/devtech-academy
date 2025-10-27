# Gerenciamento de Alunos

Aplicação cliente (página estática) para cadastrar, editar, listar e gerar relatórios de alunos.

## rodar (local)

```bash
docker build -t ec01-alunos .
docker compose up --build
# ou
docker run -d -p 8081:80 ec01-alunos


# abrir http://localhost:8081
