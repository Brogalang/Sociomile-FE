# Sociomile Frontend

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Sociomile Frontend** adalah dashboard modern untuk sistem *Omnichannel Customer Support*. Aplikasi ini dirancang khusus untuk memudahkan agent dalam mengelola percakapan dan pesan dari berbagai platform dalam satu antarmuka yang intuitif.

---

## Features

* **Secure Login** – Autentikasi berbasis JSON Web Token (JWT).
* **Omnichannel Dashboard** – Menampilkan daftar percakapan secara real-time.
* **Message History** – Riwayat pesan yang lengkap dan terstruktur.
* **Instant Messaging** – Mengirim pesan langsung ke customer.
* **Pagination** – Manajemen beban data pada daftar percakapan.
* **Auto Scroll** – Pengalaman chat yang mulus dengan fitur auto-scroll ke pesan terbaru.
* **Backend Integration** – Terkoneksi penuh dengan Sociomile Backend API.

---

## Tech Stack

- **Framework:** React.js
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Containerization:** Docker
- **Styling:** Tailwind CSS (Recommended)

---

## Project Structure

```text
frontend
├── public/                 # Static assets (favicons, SVG sprite)
├── src/
│   ├── api/                # Axios instance & interceptors config
│   │   └── axios.js
│   ├── assets/             # Images & global SVG icons
│   ├── components/         # Reusable UI Components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Main view components (Route targets)
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Chat.jsx
│   │   ├── Conversations.jsx
│   │   └── Tickets.jsx
│   ├── services/           # Business logic & API calls per module
│   │   ├── authService.js
│   │   ├── conversationService.js
│   │   └── ticketService.js
│   ├── App.jsx             # Root component & Routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── docker-compose.yml      # Docker orchestration (optional)
├── Dockerfile              # Container configuration
└── vite.config.js          # Vite configuration
```
## Getting Started
Run with Docker (Recommended)
Project ini telah dikonfigurasi untuk berjalan selaras dengan ekosistem backend menggunakan Docker Compose.

Jalankan seluruh layanan:

````Bash
docker compose up --build
````



Akses aplikasi di: http://localhost:5173

## Author
Galang Satria Wibowo