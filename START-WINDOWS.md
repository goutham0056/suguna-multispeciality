# Windows quick start

1. Open `backend/.env.example`, copy it to `backend/.env`.
2. Fill in your MongoDB Atlas password and cluster host.
3. Set `JWT_SECRET` and `ADMIN_KEY` to private values.
4. Terminal 1:

```powershell
cd backend
npm install
npm run dev
```

5. Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

6. Open `http://localhost:5173`.
7. Admin portal: `http://localhost:5173/admin`.

MongoDB Atlas IP access can stay restricted to the existing `157.51.80.186/32` entry during this development session. Do not add `0.0.0.0/0` unless you intentionally choose a different network policy.
