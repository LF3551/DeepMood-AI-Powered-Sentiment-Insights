# Backend
FROM python:3.8-slim as backend

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend .

# Frontend
FROM nginx:alpine as frontend

COPY frontend /usr/share/nginx/html 