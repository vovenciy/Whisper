# --- Этап 1: Сборка React приложения ---
FROM node:20-alpine AS build
WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm install --verbose

# Копируем весь исходный код и собираем проект
COPY . .
RUN npm run build
# (Примечание: Vite собирает в папку /app/dist, а Create React App в /app/build. 
# Если у вас CRA, в следующем этапе измените "dist" на "build")

# --- Этап 2: Запуск веб-сервера Nginx ---
FROM nginx:stable-alpine

# Копируем наш кастомный конфиг Nginx внутрь образа
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Копируем статические файлы React из предыдущего этапа (build) в папку Nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
