# Gerenciamento de Funcionarios
Aplicação cliente (página estática) para cadastrar, editar, listar e gerar relatorios de funcionarios

## rodar (local)

```bash
docker build -t ec02-funcionarios .
docker compose up --build
# ou
docker run -d -p 8082:80 ec02-funcionarios


# abrir http://localhost:8082
