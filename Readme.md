# 📝 TaskMaster Pro: Unified Monolith API

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)](https://spring.io/projects/spring-boot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, **production-ready** To-Do application. This project consolidates identity management and task CRUD into a single, cohesive monolithic service, optimized for both cloud deployment and local-first mobile/desktop clients.

---

## 🚀 Key Features

* **Internal Auth System:** Fully integrated JWT authentication (migrated from microservice).
* **Stateless Security:** Implements `HS256` or `RS256` token validation.
* **Database Integrity:** Strict SQL Foreign Keys between `Users` and `Tasks`.
* **Flyway Migrations:** Version-controlled database schema changes.
* **Local-First Ready:** API structure designed to support offline sync for mobile/desktop apps.

---

## 🛠 Tech Stack

* **Backend:** Java 17+ / Spring Boot 3.x
* **Security:** Spring Security + JJWT
* **Database:** PostgreSQL (Production) / H2 (Dev/Test)
* **Documentation:** SpringDoc OpenAPI (Swagger UI)
* **Build Tool:** Maven

---

## 🏗 Architecture

The application follows a **Layered Monolith** pattern. By merging Auth and Tasks, we eliminate inter-service latency and simplify the CI/CD pipeline.

```mermaid
graph TD
    User((User)) -->|Request + JWT| API[REST Controllers]
    API -->|Auth Check| Sec[Spring Security Filter]
    Sec -->|Valid| Service[Business Logic Layer]
    Service -->|JPA| DB[(PostgreSQL)]