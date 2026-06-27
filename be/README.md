# ECEP Backend Boilerplate

## Cau truc thu muc

```text
be/
|-- ecosystem.config.js
|-- package.json
|-- tsconfig.json
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- config/
|   |   |-- data-source.ts
|   |   `-- env.ts
|   |-- constants/
|   |   `-- common.ts
|   |-- controllers/
|   |   |-- auth.controller.ts
|   |   |-- certificate.controller.ts
|   |   `-- exam.controller.ts
|   |-- entities/
|   |   |-- certificate.entity.ts
|   |   |-- exam.entity.ts
|   |   |-- exam-question.entity.ts
|   |   |-- exam-result.entity.ts
|   |   |-- user-session.entity.ts
|   |   `-- user.entity.ts
|   |-- middlewares/
|   |   |-- auth.middleware.ts
|   |   |-- error-handler.middleware.ts
|   |   `-- upload.middleware.ts
|   |-- repositories/
|   |   |-- certificate.repository.ts
|   |   |-- exam-question.repository.ts
|   |   |-- exam-result.repository.ts
|   |   |-- exam.repository.ts
|   |   |-- user-session.repository.ts
|   |   `-- user.repository.ts
|   |-- routes/
|   |   |-- auth.routes.ts
|   |   |-- certificate.routes.ts
|   |   |-- exam.routes.ts
|   |   `-- index.ts
|   |-- services/
|   |   |-- auth.service.ts
|   |   |-- certificate.service.ts
|   |   `-- exam.service.ts
|   |-- utils/
|   |   |-- app-error.ts
|   |   |-- async-handler.ts
|   |   |-- hash.ts
|   |   `-- token.ts
|   `-- validators/
|       |-- auth.validator.ts
|       |-- certificate.validator.ts
|       `-- exam.validator.ts
`-- .env.example
```

## Auth noi bo

Su dung mo hinh:

- `Access Token JWT` de goi API
- `Refresh Token` duoc luu dang hash trong bang `user_sessions`
- Middleware `authenticate` kiem tra ca JWT va session DB de ho tro logout/revoke

Role hien tai trong he thong:

- `super_admin`
- `partleader`
- `employee`

### API dang nhap

`POST /api/auth/login`

```json
{
  "email": "anv@company.local",
  "password": "StrongPassword123"
}
```

### Tao password hash de seed user

```bash
npm run hash:password -- StrongPassword123
```

Lay ket qua tra ve va luu vao cot `users.password_hash`.

## Cau hinh MySQL hien tai

File [.env](/Users/hienvan/Code/exam-certi-staff/be/.env) hien de o dang placeholder an toan:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_SOCKET_PATH=/tmp/mysql.sock` neu MySQL local chi mo socket, chua mo TCP
- `DB_USERNAME=root`
- `DB_PASSWORD=change_me`
- `DB_NAME=ecep_db`

Khuyen nghi:

- Co the dung `root` de bootstrap local nhanh.
- Mat khau that chi nen nhap truc tiep trong file `.env` tren may cua ban, khong dua vao README hay commit.
- Khi dua len may chu on-premise thuc te, nen tao user rieng cho ung dung, chi cap quyen tren database `ecep_db`.

### API lay thong tin user dang nhap

`GET /api/auth/me`

Header:

- `Authorization: Bearer <access_token>`

### API dang xuat

`POST /api/auth/logout`

```json
{
  "refreshToken": "refresh_token_nhan_duoc_khi_login"
}
```

## API mau

### 1. Upload chung chi

`POST /api/certificates/upload`

Header:

- `Authorization: Bearer <access_token>`

Form-data:

- `userId`
- `title`
- `issueDate` (`YYYY-MM-DD`)
- `expiryDate` (`YYYY-MM-DD`, optional)
- `file`

### 2. Nop bai thi

`POST /api/exams/:examId/submit`

Header:

- `Authorization: Bearer <access_token>`

```json
{
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": "B" }
  ]
}
```
