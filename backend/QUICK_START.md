# 🚀 Quick Reference - Development Workflow

## After Making Code Changes

```bash
./dev.sh rebuild
```

That's it! This command:
1. ✅ Builds the JAR with Maven (`mvn clean package -DskipTests`)
2. ✅ Restarts the app container (2-5 seconds)
3. ✅ Keeps database and Redis running

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `./dev.sh build` | Build JAR for the first time |
| `./dev.sh start` | Start all services (postgres, redis, app) |
| `./dev.sh rebuild` | **Rebuild after code changes** ⭐ |
| `./dev.sh logs` | View all logs |
| `./dev.sh logs universe-app` | View app logs only |
| `./dev.sh stop` | Stop all services |
| `./dev.sh status` | Check service status |

---

## First Time Setup

```bash
# 1. Build the JAR
./dev.sh build

# 2. Start services
./dev.sh start

# 3. (Optional) Watch logs
./dev.sh logs universe-app
```

---

## Typical Workflow

```bash
# Morning: Start services
./dev.sh start

# During development: After each code change
./dev.sh rebuild

# Evening: Stop services (optional)
./dev.sh stop
```

---

## Troubleshooting

**App won't start?**
```bash
./dev.sh logs universe-app
```

**Need fresh database?**
```bash
./dev.sh clean
./dev.sh build
./dev.sh start
```

**Port already in use?**
```bash
./dev.sh stop
```

---

## 📖 Full Documentation

See [DEV_WORKFLOW.md](./DEV_WORKFLOW.md) for complete guide.
