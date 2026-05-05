FROM nginx:1.27-alpine

COPY deployment/self-hosted/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY README.md /usr/share/nginx/html/README.md
COPY manifest.webmanifest /usr/share/nginx/html/manifest.webmanifest
COPY service-worker.js /usr/share/nginx/html/service-worker.js
COPY assets /usr/share/nginx/html/assets
COPY docs /usr/share/nginx/html/docs
COPY db /usr/share/nginx/html/db
