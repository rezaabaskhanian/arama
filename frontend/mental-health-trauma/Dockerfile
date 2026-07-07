FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# آدرس API در زمان build داخل بسته‌ی فرانت قرار می‌گیرد (NEXT_PUBLIC_*)
# روی VPS این را به آدرس عمومی بک‌اند ست کنید، مثلاً https://api.example.com/
ARG NEXT_PUBLIC_API_URL=http://localhost:8086/
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]