## build
- Bật db: cd database && docker compose up -d
- Bật fe: cd client && npm run start
- Bật backend: cd server && npm run build:dev

## init database
- tsc để compile typescript
- node dist/seed-escrow.js để khởi tạo dữ liệu mẫu