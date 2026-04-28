# SavingsBE — Express + Neon PostgreSQL Backend

## Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Neon (Serverless PostgreSQL)
- **Driver**: @neondatabase/serverless

---

## Setup

### 1. Get your Neon connection string
1. Go to https://console.neon.tech
2. Create a project → copy the **Connection String**
3. It looks like: `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`

### 2. Configure .env
```
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Install & Run
```bash
npm install
npm run dev      # development (nodemon)
npm start        # production
```

Tables are **auto-created** on first run. Default accounts (Cash, Bank, UPI) are seeded automatically.

---

## API Reference

### Health
| Method | Endpoint  | Description |
|--------|-----------|-------------|
| GET    | /health   | Server health check |

---

### Transactions `/api/transactions`

| Method | Endpoint                        | Description |
|--------|---------------------------------|-------------|
| GET    | /api/transactions               | Get all transactions |
| GET    | /api/transactions?month=2025-04 | Filter by month |
| GET    | /api/transactions?type=debit    | Filter by type |
| GET    | /api/transactions?account=cash  | Filter by account |
| GET    | /api/transactions/summary       | Monthly summary stats |
| GET    | /api/transactions/summary?month=2025-04 | Summary for specific month |
| GET    | /api/transactions/:id           | Get single transaction |
| POST   | /api/transactions               | Create transaction |
| PUT    | /api/transactions/:id           | Update transaction |
| DELETE | /api/transactions/:id           | Delete transaction |

#### POST /api/transactions — Body
```json
{
  "title":    "Lunch",
  "item":     "Biryani",
  "amount":   250.00,
  "type":     "debit",
  "category": "food",
  "account":  "cash",
  "note":     "Office lunch",
  "date":     "2025-04-28"
}
```

#### GET /api/transactions/summary — Response
```json
{
  "success": true,
  "data": {
    "month": "2025-04",
    "total_income": "50000.00",
    "total_expense": "18500.00",
    "net_savings": "31500.00",
    "total_transactions": "12",
    "by_category": [...],
    "by_account": [...]
  }
}
```

---

### Accounts `/api/accounts`

| Method | Endpoint            | Description |
|--------|---------------------|-------------|
| GET    | /api/accounts       | Get all accounts |
| POST   | /api/accounts       | Create account |
| DELETE | /api/accounts/:id   | Delete account |

#### POST /api/accounts — Body
```json
{
  "name":  "Savings",
  "color": "#8b5cf6"
}
```
