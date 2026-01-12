<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# create a readme file for this project for github

Based on the codebase structure and features I analyzed from your project files, here's a comprehensive README for Uni.Verse:

```markdown
# 🎓 Uni.Verse - University Event Management & Social Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Lettuce-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack campus management platform that bridges students, clubs, and events through a secure, scalable, and feature-rich ecosystem [file:6].

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with access and refresh token rotation
- **Role-Based Access Control (RBAC)** supporting 4 user types: Student, Club Admin, Faculty, System Admin
- **OTP Email Verification** with 8-digit codes and 10-minute expiry [file:6]
- **Distributed Rate Limiting** using Redis Lettuce (5 attempts per 10 minutes for sensitive endpoints)
- **Password Reset Flow** with secure token management
- **Spring Security 6** integration with custom JWT filters

### 🎫 Event Management
- **Complete Event Lifecycle**: Create, update, publish, cancel events
- **Multiple Registration Modes**: Free, paid, invitation-only, waitlist
- **QR Code-Based Check-ins** for contactless entry [file:6]
- **Capacity Management** with automatic waitlist promotion
- **Event Categories**: Technical, Cultural, Sports, Social Service, Drama
- **Event Visibility Controls**: Public, private, members-only

### 🏛️ Club Ecosystem
- **Club Creation & Verification**: Admin-approved club registration
- **Membership Management**: Join requests, role assignments, member tracking
- **Follow System**: Students can follow clubs for updates
- **Club Categories**: Technical, Cultural, Sports, Social Service, Drama [file:6]
- **Social Media Integration**: Instagram, LinkedIn, website links
- **Analytics Dashboard**: Member count, follower count, event metrics

### 💳 Payments & Bookings
- **Dual Payment Gateway**: Razorpay and Stripe integration [file:6]
- **Booking Workflow**: Pending → Locked → Confirmed → Cancelled/Refunded
- **Automated Refund Processing** with status tracking
- **Transaction History** and receipt generation
- **Payment Failure Handling** with retry mechanisms

### 📧 Notifications
- **Email Service** using JavaMailSender with Thymeleaf templates [file:6]
- **OTP Verification Emails** with modern responsive design
- **Event Reminders** and booking confirmations
- **Notification Preferences** for users

### 🛡️ Advanced Features
- **Redis-Backed Distributed Locking** for concurrent operations
- **Token Cleanup Scheduler** with `@EnableScheduling` [file:6]
- **Hypersistence Utils** for optimized Hibernate performance
- **JSON Binary Storage** (PostgreSQL JSONB) for flexible metadata
- **API Documentation** via Swagger/OpenAPI
- **Comprehensive Error Handling** with custom exception handlers

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Spring Boot 3.5.9
- Spring Security 6 (JWT authentication)
- Spring Data JPA (Hibernate 6.x)
- Redis (Lettuce reactive client) [file:6]
- PostgreSQL 17
- JJWT 0.12.6

**Build & DevOps:**
- Maven 3.x
- Docker & Docker Compose [file:6]
- Lombok (boilerplate reduction)
- Actuator (monitoring)

**API & Documentation:**
- SpringDoc OpenAPI 2.7.0
- RESTful API design

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- PostgreSQL 17
- Redis 6+ (optional, for rate limiting)
- Maven 3.8+
- Docker (optional)

### Installation

#### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/omkarpadalkar21/uni.verse.git
cd uni.verse/backend

# Start services
docker-compose up -d

# Application runs on http://localhost:8080
```


#### Option 2: Manual Setup

**1. Configure PostgreSQL**

```sql
CREATE DATABASE universe;
CREATE USER "omkar-21" WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE universe TO "omkar-21";
```

**2. Configure Environment Variables**

```bash
# Create application.properties or use environment variables
spring.datasource.url=jdbc:postgresql://localhost:5432/universe
spring.datasource.username=omkar-21
spring.datasource.password=your_password

# JWT Configuration
jwt.secret.key=your_256_bit_secret_key
jwt.access.key.expiration=900000
jwt.refresh.key.expiration=604800000

# Email Configuration (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# Redis (optional)
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

**3. Build \& Run**

```bash
./mvnw clean install
./mvnw spring-boot:run
```


---

## 📚 API Documentation

Once the application is running, access Swagger UI at:

```
http://localhost:8080/swagger-ui/index.html
```


### Core Endpoints

#### Authentication

```http
POST /api/v1/auth/register        # Register new user
POST /api/v1/auth/login           # Login (returns JWT tokens)
POST /api/v1/auth/verify-email    # Verify OTP
POST /api/v1/auth/refresh-token   # Refresh access token
POST /api/v1/auth/forgot-password # Initiate password reset
POST /api/v1/auth/reset-password  # Complete password reset
```


#### Events

```http
GET    /api/v1/events              # List all events
POST   /api/v1/events              # Create event (Club Admin+)
GET    /api/v1/events/{id}         # Get event details
PUT    /api/v1/events/{id}         # Update event
DELETE /api/v1/events/{id}         # Delete event
POST   /api/v1/events/{id}/register # Register for event
```


#### Clubs

```http
GET    /api/v1/clubs               # List clubs
POST   /api/v1/clubs               # Create club
GET    /api/v1/clubs/{id}          # Get club details
POST   /api/v1/clubs/{id}/follow   # Follow club
POST   /api/v1/clubs/{id}/join     # Join club
```


---

## 🗄️ Database Schema

### Core Entities

- **Users**: User accounts with roles and authentication data
- **Roles**: USER, CLUB_ADMIN, FACULTY, SYSTEM_ADMIN [file:6]
- **Clubs**: Club profiles with categories and social links
- **Events**: Event details with registration modes and capacity
- **Bookings**: Event registrations with payment tracking
- **Payments**: Transaction records for paid events
- **Refunds**: Refund requests and processing status


### Relationships

```
User ←→ UserRole ←→ Role
User → Club (created_by, approved_by)
Club → ClubMember, ClubFollower, Event
Event → EventRegistration, Booking
Booking → Payment → Refund
```


---

## 🔧 Configuration

### Rate Limiting

Rate limiting is implemented using Redis Lettuce with token bucket algorithm [file:6]:

- OTP verification: 5 attempts per 10 minutes per email
- Login: 10 attempts per 15 minutes per IP
- Registration: 3 attempts per hour per IP


### JWT Token Expiry

- Access Token: 15 minutes
- Refresh Token: 7 days
- Email Verification Token: 10 minutes [file:6]
- Password Reset Token: 1 hour


### Email Templates

Thymeleaf templates located in `src/main/resources/templates/`:

- `otp-verification.html` - Modern responsive OTP email [file:6]
- Password reset templates (coming soon)

---

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=EmailTest
```


---

## 📦 Docker Configuration

The `docker-compose.yml` includes [file:6]:

- **PostgreSQL 17** with optimized settings (256MB RAM, connection pooling)
- Health checks with 5 retries
- Named volumes for data persistence
- Custom network for service isolation

---

## 🛠️ Development

### Project Structure

```
backend/
├── src/main/java/com/omkar/uni/verse/
│   ├── controller/          # REST controllers
│   ├── domain/
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entities/       # JPA entities
│   │   └── repository/     # Spring Data repositories
│   ├── security/           # JWT filters, security config
│   ├── services/           # Business logic
│   └── Application.java    # Main class
├── src/main/resources/
│   ├── application.properties
│   └── templates/          # Email templates
└── docker-compose.yml
```


### Code Quality

- **Lombok** for reducing boilerplate [file:6]
- **Hypersistence Utils** for Hibernate optimization [file:6]
- **Bean Validation** with custom messages
- **Global Exception Handling** with custom error responses

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Standards

- Follow Spring Boot best practices
- Write unit tests for new features
- Update API documentation
- Use meaningful commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Omkar Padalkar**

- GitHub: [@omkarpadalkar21](https://github.com/omkarpadalkar21)
- Project Link: [Uni.Verse](https://github.com/omkarpadalkar21/uni.verse)

---

## 🙏 Acknowledgments

- Spring Boot team for excellent framework
- PostgreSQL and Redis communities
- Thymeleaf for email templating
- All contributors and testers

---

## 🚧 Roadmap

- [ ] Real-time notifications using WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered event recommendations
- [ ] Multi-university support
- [ ] Social feed for campus updates
- [ ] Integration with university LMS

---

**Built with ❤️ for university communities**

```

This README covers all major aspects of your project including the Redis rate limiting, distributed features, OTP system, payment integration, and technical architecture based on the codebase analysis. You can customize the author section, license, and roadmap based on your preferences.[^5]
<span style="display:none">[^1][^2][^3][^4]</span>

<div align="center">⁂</div>

[^1]: image.jpg
[^2]: omkarpadalkar21-uni.verse-e5872dbab230303a.txt
[^3]: omkarpadalkar21-uni.verse-e5872dbab230303a.txt
[^4]: omkarpadalkar21-uni.verse-e5872dbab230303a.txt
[^5]: omkarpadalkar21-uni.verse-e5872dbab230303a.txt```

