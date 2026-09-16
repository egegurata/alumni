# 🎓 Alumni Tracking System (`alumni`)

A full-stack **Alumni Tracking System** built for the **Web Programming (YBSB3001)** course at **Istanbul University, Department of Management Information Systems (Fall 2026)**, taught by **Assoc. Prof. Dr. Emre Akadal**.

- **Author:** Ege Gürkan Atalay (`egegurkanatalay@ogr.iu.edu.tr`)
- **Repository:** `https://github.com/egegurata/alumni`

## 🎯 What the System Is & What It Must Do
The Alumni Tracking System organizes university graduates and students in one platform, tracking alumni profiles, graduation years, career placements, institutional announcements, job postings, and candidate applications.

## 💻 Language & Database Decisions (Why & One Weakness of Each)

| Layer | Chosen Technology | Why We Chose It (Reason) | One Weakness (What It Is Bad At) |
| :--- | :--- | :--- | :--- |
| **Back-End Language** | **JavaScript (Node.js & Express.js)** | Non-blocking, event-driven I/O handles concurrent HTTP requests and JSON payloads natively with minimal overhead. | **Single-threaded Event Loop:** Heavy CPU-bound tasks block the main thread; dynamic typing requires explicit runtime validation. |
| **Database (DBMS)** | **PostgreSQL 16** | Strict ACID compliance, relational foreign keys, composite unique constraints, and reliable Docker volume persistence. | **Horizontal Write Scaling & Connection Cost:** Harder to shard horizontally than NoSQL, and process-per-connection requires connection pooling. |

## 🚀 How to Run It
```bash
docker compose up
```
