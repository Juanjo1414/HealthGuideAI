# Build multi-stage: compilamos con Node y servimos los estaticos con nginx —
# la imagen final no lleva Node ni node_modules, solo el resultado de `vite build`.

FROM node:20-slim AS build
WORKDIR /app

# package*.json antes que el resto del codigo, mismo criterio de cacheo que
# el Dockerfile del backend con requirements.txt.
COPY package.json package-lock.json ./

# npm tiene un bug conocido (npm/cli#4028, "Exit handler never called!") que
# en redes inestables deja `npm ci` a medias SIN devolver exit code != 0 —
# el layer queda en verde pero node_modules/.bin/vite nunca se instala, y el
# build del bundle final termina sirviendo una app vieja sin avisar. Subimos
# los reintentos/timeouts de npm para tolerar la red, y sobre todo agregamos
# una verificacion explicita despues del install: si vite no quedo instalado,
# la imagen falla en vez de construirse "exitosamente" a medias.
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci \
    && test -x node_modules/.bin/vite || (echo "ERROR: vite no se instalo (ver bug npm/cli#4028)" && exit 1)

COPY . .

# Vite hornea las variables VITE_* en el bundle en tiempo de BUILD, no las lee
# en runtime — por eso esto es un ARG con valor por defecto, no una variable
# que se pueda cambiar despues de construir la imagen. El valor real para
# docker-compose se fija en docker-compose.yml.
ARG VITE_API_BASE_URL=http://127.0.0.1:8000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# ENTRYPOINT explicito (no CMD) por la misma razon que el backend: fija el
# proceso principal en vez de dejarlo como el CMD por defecto de la imagen
# base, que un `docker run` podria reemplazar sin querer.
ENTRYPOINT ["nginx", "-g", "daemon off;"]
