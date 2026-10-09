# 📚 Euphoria Book Store

**A beautiful, user-friendly online bookstore built to make discovering and managing books easier.**

Euphoria Book Store is a web application designed with a warm, elegant, and vintage-library aesthetic. It allows users to explore books, browse categories, and interact with a simple bookstore interface.

## ✨ Features

- 🏠 **Home Page** — An inviting landing page with featured sections.
- 📚 **Book Collection** — Browse available books and view their details.
- 🗂️ **Categories** — Explore books organized by category.
- ➕ **Add Books** — Add new books with details and cover images.
- ✏️ **Edit Books** — Update existing book information.
- 🖼️ **Book Cover Images** — Display book covers using uploaded images.
- 🛒 **Cart and Checkout** — Navigate through the shopping and checkout flow.
- 📖 **About Page** — Learn about the bookstore.
- 📩 **Contact Page** — Access the contact section.
- 🗄️ **MongoDB Atlas** — Store and manage book data in the database.

## 🛠️ Technologies Used

- **Frontend:** HTML, CSS, Tailwind CSS, EJS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Templating Engine:** EJS
- **Version Control:** Git and GitHub
- **Deployment:** Render

## 📁 Project Structure

```text
Euphoria/
├── public/
│   └── uploads/          # Uploaded book covers and website images
├── views/
│   ├── includes/
│   │   ├── nav.ejs
│   │   └── footer.ejs
│   ├── about.ejs
│   ├── adminlogin.ejs
│   ├── books.ejs
│   ├── categories.ejs
│   ├── checkout.ejs
│   ├── contact.ejs
│   ├── editbook.ejs
│   ├── home.ejs
│   └── newbook.ejs
├── index.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- A MongoDB Atlas account

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd euphoria-book-store
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your MongoDB Atlas connection string:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

Replace the placeholder with your actual connection string. Keep `.env` private and never commit it to GitHub.

### 4. Start the application

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:3000
```

Make sure your application uses the appropriate environment variable and port configuration.

## 🗄️ Database

Euphoria Book Store uses MongoDB Atlas to store book information. Configure the database connection through the `MONGODB_URI` environment variable.

Ensure your Atlas database user has the required permissions and that your application's network access is configured correctly.

## 🎨 Design Highlights

- Elegant, vintage-library-inspired interface
- Warm, earthy colors and refined typography
- Responsive layouts and interactive hover effects
- Reusable navigation and footer components
- Book cover images and category-based browsing

## 🚀 Deployment

The application can be deployed using [Render](https://render.com/).

Configure the following settings in your Render Web Service:

- **Build Command:** `npm install`
- **Start Command:** `npm start`

Add `MONGODB_URI` and any other required secrets in Render's Environment settings. Never upload your `.env` file or credentials to the repository.

## 🔮 Future Improvements

- User registration and authentication
- Book search and advanced filtering
- Wishlist and personalized recommendations
- Improved order management
- Persistent cloud storage for uploaded images
- Integration with a secure payment gateway

## 👩‍💻 Project Purpose

This project was developed as a practical learning experience in full-stack web development, combining frontend design, server-side programming, database integration, and deployment.

---

**Euphoria Book Store — Where every book opens a new world.** 📖✨
