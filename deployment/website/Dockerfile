FROM nginx:1.27-alpine

COPY deployment/website/nginx.conf /etc/nginx/conf.d/default.conf
COPY website /usr/share/nginx/html
COPY downloads /usr/share/nginx/html/downloads
COPY docs /usr/share/nginx/html/docs
