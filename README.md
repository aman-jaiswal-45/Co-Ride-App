# 🚗 Co-Ride App

A modern and responsive MERN stack application that allows users to book and offer rides conveniently. The project provides real-time interactions, role-based access, and a seamless user experience.

🔗 **Live Site**: [https://co-ride-app.vercel.app](https://co-ride-app.vercel.app)

---

## 📌 Features

- 🔐 **Authentication & Authorization** (Login / Signup)
- 👥 **Role-based access** (Rider & Passenger)
- 📅 **Book / Offer Rides**
- 🗺️ **View Available Rides**
- 🛒 **Cart functionality for bookings**
- 📜 **Ride History and Upcoming Rides**
- 🧾 **Coupon Code Support**
- 🌙 **Dark Mode Support**
- 💬 **Toast Notifications**
- ⚙️ **Admin/User Dashboard**
- ✅ **Responsive UI using Tailwind CSS + ShadCN UI**
- ⚡ **Real-time functionality with Socket.IO**
- 📦 **Deployed on Vercel (Frontend) and Render (Backend)**

---

## 🚀 Tech Stack

### Frontend

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router](https://reactrouter.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)
- [Lucide Icons](https://lucide.dev/)
- [Socket.IO-client](https://socket.io/)

### Backend

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/)
- [JWT](https://jwt.io/)
- [CORS, dotenv, bcrypt](https://www.npmjs.com/)

---

## 📁 Folder Structure

```bash
Co-Ride-App/
├── client/        # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
├── server/        # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── .env
