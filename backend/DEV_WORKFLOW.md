# Development Workflow Guide

This guide explains how to run the UniVerse backend in development mode with **fast iteration** using local JAR builds and Docker volume mounting.

## 🚀 Quick Start

### First Time Setup

1. **Build the JAR:**
   ```bash
   ./dev.sh build
   ```

2. **Start all services:**
   ```bash
   ./dev.sh start
   ```

3. **View logs (optional):**
   ```bash
   ./dev.sh logs
   ```

That's it! Your app is now running at `http://localhost:8080`

---

## 🔄 Development Workflow

### When You Make Code Changes

**Option 1: Using the helper script (Recommended)**
```bash
./dev.sh rebuild
```

**Option 2: Manual commands**
```bash
# Build the JAR locally
mvn clean package -DskipTests

# Restart the app container
docker compose -f docker-compose.dev.yml restart universe-app
```

### Why This is Fast ⚡

- ✅ **No Docker build** - Maven runs on your local machine (faster)
- ✅ **No dependency downloads** - Maven cache is on your machine
- ✅ **Instant restart** - Only the app container restarts (2-5 seconds)
- ✅ **Postgres & Redis stay running** - No data loss between rebuilds

---

## 📋 Available Commands

### Helper Script Commands

```bash
./dev.sh build       # Build the JAR file with Maven
./dev.sh start       # Start all services (postgres, redis, app)
./dev.sh stop        # Stop all services
./dev.sh restart     # Restart the app container only
./dev.sh rebuild     # Build JAR + restart app (use after code changes)
./dev.sh logs        # Show logs for all services
./dev.sh logs <service>  # Show logs for specific service
./dev.sh status      # Show status of all services
./dev.sh clean       # Stop services and remove volumes
./dev.sh help        # Show help suspensionReason
```

### Examples

```bash
# View only app logs
./dev.sh logs universe-app

# View only database logs
./dev.sh logs postgres

# Check if services are running
./dev.sh status

# Stop everything
./dev.sh stop

# Clean everything (removes volumes too)
./dev.sh clean
```

---

## 🔧 Manual Docker Compose Commands

If you prefer not to use the helper script:

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart app after rebuilding JAR
docker compose -f docker-compose.dev.yml restart universe-app

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker compose -f docker-compose.dev.yml down -v
```

---

## 📁 File Structure

```
backend/
├── docker-compose.yml         # Production build (multi-stage Dockerfile)
├── docker-compose.dev.yml     # Development (volume mount)
├── Dockerfile                 # Production Dockerfile
├── dev.sh                     # Development helper script
├── target/
│   └── uni.verse-0.0.1-SNAPSHOT.jar  # Built JAR (mounted into container)
└── ...
```

---

## 🎯 Development vs Production

### Development Mode (`docker-compose.dev.yml`)
- ✅ **Fast iteration** - Build locally, mount JAR
- ✅ **Quick restarts** - 2-5 seconds
- ✅ **Easy debugging** - Local Maven, familiar tools
- ⚠️ **Requires local build** - Must run `mvn package` first

### Production Mode (`docker-compose.yml`)
- ✅ **Reproducible builds** - Everything in Docker
- ✅ **Optimized caching** - Multi-stage build with layers
- ✅ **Security** - Non-root user, minimal image
- ⚠️ **Slower builds** - Downloads dependencies in Docker

---

## 🐛 Troubleshooting

### "No such file or directory: target/uni.verse-0.0.1-SNAPSHOT.jar"

**Solution:** Build the JAR first
```bash
./dev.sh build
```

### App won't start / keeps restarting

**Check logs:**
```bash
./dev.sh logs universe-app
```

**Common issues:**
- Database not ready → Wait for postgres healthcheck
- Redis password mismatch → Check `.env` file
- Port 8080 already in use → Stop other services

### Changes not reflecting

**Make sure you rebuild:**
```bash
./dev.sh rebuild
```

### Database connection errors

**Check if postgres is healthy:**
```bash
./dev.sh status
```

**Restart postgres:**
```bash
docker compose -f docker-compose.dev.yml restart postgres
```

---

## 💡 Tips & Best Practices

### 1. **Keep logs open in a separate terminal**
```bash
# Terminal 1: Logs
./dev.sh logs universe-app

# Terminal 2: Development
./dev.sh rebuild
```

### 2. **Skip tests during development**
The helper script already uses `-DskipTests`, but if running manually:
```bash
mvn clean package -DskipTests
```

### 3. **Use hot reload for frontend**
This setup is for the backend. For frontend, use `npm run dev` separately.

### 4. **Database persistence**
Data persists between restarts. To reset:
```bash
./dev.sh clean  # Removes volumes
./dev.sh start  # Fresh start
```

### 5. **Check service health**
```bash
# App health
curl http://localhost:8080/actuator/health

# Postgres
docker exec universe-postgres-dev pg_isready

# Redis
docker exec universe-redis-dev redis-cli ping
```

---

## 🔄 Typical Development Session

```bash
# 1. Start of day - start services
./dev.sh start

# 2. Make code changes in your IDE
# ... edit files ...

# 3. Rebuild and restart
./dev.sh rebuild

# 4. Test your changes
curl http://localhost:8080/api/v1/...

# 5. Repeat steps 2-4 as needed

# 6. End of day - stop services (optional)
./dev.sh stop
```

---

## ⏱️ Performance Comparison

| Action | Production Build | Development Build |
|--------|-----------------|-------------------|
| First build | ~2-5 minutes | ~30-60 seconds |
| Rebuild (no changes) | ~1-2 minutes | ~5-10 seconds |
| Rebuild (code changes) | ~1-2 minutes | ~20-30 seconds |
| Container restart | ~10-15 seconds | ~2-5 seconds |

**Development mode is 3-10x faster!** 🚀

---

## 📚 Additional Resources

- [Spring Boot Docker Documentation](https://spring.io/guides/topicals/spring-boot-docker/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Maven Documentation](https://maven.apache.org/guides/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the logs: `./dev.sh logs`
2. Verify services are healthy: `./dev.sh status`
3. Try a clean restart: `./dev.sh clean && ./dev.sh build && ./dev.sh start`
