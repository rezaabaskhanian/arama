FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# آدرس API در زمان build داخل بسته‌ی فرانت قرار می‌گیرد (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL=http://localhost:8086/
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# فقط standalone output + static files + public کپی می‌شن
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
