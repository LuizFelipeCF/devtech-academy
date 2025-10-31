# Usa imagem leve com servidor web
FROM nginx:stable-alpine

# Remove o conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia todos os arquivos do projeto para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando padrão de inicialização
CMD ["nginx", "-g", "daemon off;"]
