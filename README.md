# 🌐 Social API

A production-ready RESTful API for a social media platform — built with Node.js, Express, and PostgreSQL. Designed for scale from day one.

---

## ✨ Features

| Feature               | Details                                                     |
| --------------------- | ----------------------------------------------------------- |
| 🔐 **Authentication** | JWT access + refresh token strategy                         |
| 📝 **Posts**          | Create, edit, delete with image upload & visibility control |
| 💬 **Comments**       | Flat thread with one-level replies                          |
| ❤️ **Likes**          | Unified like system for posts and comments                  |
| 📰 **Feed**           | Cursor-based paginated feed — scales to millions of records |
| 🖼️ **Image Upload**   | Local storage via Multer with type & size validation        |
| 🐳 **Docker**         | Fully containerized with Docker Compose                     |

---

## 🏗️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (raw SQL — no ORM overhead)
- **Auth:** JWT (access + refresh tokens)
- **Uploads:** Multer
- **Validation:** Zod
- **Containerization:** Docker & Docker Compose

---

## 📁 Project Structure

```
src/
├── config/         # Environment & DB config
├── database/       # Migrations
├── middlewares/    # Auth, validation, error handling
├── modules/        # Feature-based modules
│   ├── auth/
│   ├── users/
│   ├── posts/
│   ├── comments/
│   ├── likes/
│   ├── feed/
│   └── health/
├── routes/         # Route aggregator
├── utils/          # Helpers (tokens, errors, etc.)
├── app.js          # Express app
└── server.js       # Entry point
```

Each module follows a strict 3-layer architecture:

```
module/
├── controller.js   # HTTP layer — handles req/res
├── service.js      # Business logic
├── repository.js   # Database queries
├── routes.js       # Route definitions
└── validation.js   # Zod schemas
```

---

## 🧠 Key Design Decisions

### 1. Cursor-Based Pagination

Traditional offset pagination breaks at scale:

```sql
-- ❌ Degrades with millions of rows
SELECT * FROM posts LIMIT 20 OFFSET 100000;
```

This API uses cursor-based pagination instead:

```sql
-- ✅ Constant performance regardless of dataset size
SELECT * FROM posts
WHERE created_at < $cursor
ORDER BY created_at DESC
LIMIT 20;
```

No duplicate or missing posts. No performance cliff.

---

### 2. Unified Likes System

A single `likes` table handles both post and comment likes:

```sql
likes (
  user_id     UUID,
  target_type TEXT,   -- 'post' | 'comment'
  target_id   UUID
)
```

Simpler logic, easier to extend, zero duplication.

---

### 3. JWT with Refresh Token Strategy

- **Access token** — short-lived, used per request
- **Refresh token** — long-lived, stored securely, used to reissue access tokens

Balances security with a smooth user experience.

---

### 4. Post Visibility

Each post carries a `visibility` field (`public` | `private`), enforced at the SQL layer:

```sql
WHERE visibility = 'public' OR author_id = $current_user
```

No application-layer filtering. No leaks.

---

### 5. Comment Structure

Flat table with a `parent_id` for one-level replies. Deep nesting avoided intentionally:

- Keeps queries simple and fast
- No recursive joins
- Straightforward to render on the frontend

---

### 6. Performance

- Indexed columns: `created_at`, `visibility`, `author_id`
- Feed query uses a **single JOIN** — no N+1 queries
- Like state resolved via `EXISTS` subquery in the same feed query

---

## 🐳 Docker Setup

**Start all services:**

```bash
docker compose up -d --build
```

**Run migrations:**

```bash
docker compose exec backend npm run migrate:up
```

---

## ⚙️ Local Development

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

```bash
cp .env.example .env
# Fill in your values
```

**3. Start the database**

```bash
docker compose up -d postgres
```

**4. Run migrations**

```bash
npm run migrate:up
```

**5. Start the dev server**

```bash
npm run dev
```

---

## 📡 API Reference

### Auth

```
POST   /api/auth/register      Register a new user
POST   /api/auth/login         Login and receive tokens
POST   /api/auth/refresh       Refresh access token
POST   /api/auth/logout        Revoke refresh token
GET    /api/auth/me            Get current user
```

### Posts

```
POST   /api/posts              Create a post (with optional image)
GET    /api/feed               Get paginated feed
PATCH  /api/posts/:id          Update a post
DELETE /api/posts/:id          Delete a post
```

### Comments

```
POST   /api/comments/post/:postId             Comment on a post
POST   /api/comments/:commentId/replies       Reply to a comment
PATCH  /api/comments/:commentId               Edit a comment
DELETE /api/comments/:commentId               Delete a comment
```

### Likes

```
POST   /api/likes/:targetType/:targetId/toggle    Toggle like on post or comment
```

---

## 🔒 Security Notes

The following were designed but deferred due to deadline constraints. They can be added without any architectural changes:

- [ ] Rate limiting
- [ ] Advanced input sanitization
- [ ] CORS restrictions
- [ ] Helmet security headers
- [ ] Upload hardening

---

## 🚀 Scalability Considerations

The system is designed to handle:

- **Millions of posts** — cursor pagination, indexed queries
- **High read traffic** — single queries, minimal joins, no N+1
- **Storage growth** — local uploads mountable as Docker volume, swappable with S3

---

## 🔮 Future Improvements

- ☁️ Cloud storage (AWS S3 / Cloudinary)
- ⚡ Redis caching for feed and like counts
- 🔍 Full-text search
- 🔔 Notifications system
- 👥 Follow / friend system
- 🔴 Real-time updates (WebSockets)

---
