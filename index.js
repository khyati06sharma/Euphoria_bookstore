require('dotenv').config();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const multer = require("multer");
const nodemailer = require("nodemailer");
const session = require("express-session");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });


const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.log("MongoDB Error:", err);
    });

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number,
    category: String,
    image: String
});

const Book = mongoose.model("Book", bookSchema, "books_details");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


app.use((req, res, next) => {
    res.locals.isAdmin = req.session.isAdmin || false;
    const cart = req.session.cart || {};
    res.locals.cartCount = Object.values(cart)
        .reduce((total, quantity) => total + (Number(quantity) || 0), 0);
    next();
});

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.render("books.ejs", { books });
    } catch (err) {
        console.log("Error loading books:", err);
        res.send("Unable to load books.");
    }
});

function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect("/admin/login");
    }
}

app.get("/books/new", isAdmin, (req, res) => {
    res.render("newbook.ejs");
});

app.post("/books", isAdmin, upload.single("img"), async (req, res) => {
    try {
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            category: req.body.category,
            image: req.file ? "/uploads/" + req.file.filename : ""
        });

        await book.save();
        res.redirect("/books");
    } catch (err) {
        console.log("Error adding book:", err);
        res.send("Unable to add book.");
    }
});

app.get("/books/edit/:id", isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);

        if (!book) {
            return res.send("Book not found.");
        }

        res.render("editbook.ejs", { book });
    } catch (err) {
        console.log("Error opening edit page:", err);
        res.send("Unable to edit book.");
    }
});

app.post("/books/edit/:id", isAdmin, upload.single("img"), async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);

        if (!book) {
            return res.send("Book not found.");
        }

        book.title = req.body.title;
        book.author = req.body.author;
        book.price = req.body.price;
        book.category = req.body.category;

        if (req.file) {
            book.image = "/uploads/" + req.file.filename;
        }

        await book.save();
        res.redirect("/books");
    } catch (err) {
        console.log("Error updating book:", err);
        res.send("Unable to update book.");
    }
});

app.post("/books/delete/:id", isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await Book.findByIdAndDelete(id);
        res.redirect("/books");
    } catch (err) {
        console.log("Error deleting book:", err);
        res.send("Unable to delete book.");
    }
});

app.get("/categories", async (req, res) => {
    try {
        const books = await Book.find();
        res.render("categories.ejs", { books });
    } catch (err) {
        console.log("Error loading categories:", err);
        res.send("Unable to load categories.");
    }
});

app.get("/categories/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const books = await Book.find({ category: category });
        res.render("categories.ejs", { books });
    } catch (err) {
        console.log("Error loading category:", err);
        res.send("Unable to load category.");
    }
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.post("/contact", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const message = req.body.message;

    transport.sendMail({
        to: process.env.CONTACT_TO,
        replyTo: email,
        subject: "New message from Euphoria Book Store",
        text: `
Name: ${name}

Email: ${email}

Mobile: ${mobile}

Message:

${message}
`
    }, (err, info) => {
        if (err) {
            console.log("Email error:", err);
        } else {
            console.log("Email sent successfully!");
        }
    });

    res.redirect("/contact");
});

app.get("/admin/login", (req, res) => {
    res.render("adminlogin.ejs");
});

app.post("/admin/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect("/books");
    } else {
        res.send("Invalid username or password.");
    }
});

app.get("/admin/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Logout error:", err);
        }
        res.redirect("/");
    });
});

app.listen(port, () => {
    console.log(`running on port ${port}`);
});

app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = {};
    }

    res.locals.cartCount = Object.values(req.session.cart)
        .reduce((total, quantity) => total + quantity, 0);

    next();
});

async function getCartItems(cart) {
    const items = [];

    for (const [bookId, quantity] of Object.entries(cart || {})) {
        if (!mongoose.isValidObjectId(bookId)) continue;

        const book = await Book.findById(bookId);

        if (book) {
            const qty = Math.max(1, Math.min(99, Number(quantity) || 1));

            items.push({
                book,
                quantity: qty,
                subtotal: Number(book.price || 0) * qty
            });
        }
    }

    return items;
}

app.get("/cart", async (req, res) => {
    try {
        const items = await getCartItems(req.session.cart);
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);

        res.render("checkout.ejs", {
            page: "cart",
            items,
            total,
            orderItems: [],
            orderTotal: 0
        });
    } catch (err) {
        console.log("Cart error:", err);
        res.status(500).send("Unable to load your cart.");
    }
});

app.post("/cart/add/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).send("Book not found.");
        }

        const cart = req.session.cart || {};
        const currentQuantity = Number(cart[book._id.toString()]) || 0;

        cart[book._id.toString()] = Math.min(currentQuantity + 1, 99);
        req.session.cart = cart;

        res.redirect("/cart");
    } catch (err) {
        console.log("Add to cart error:", err);
        res.status(500).send("Unable to add this book to your cart.");
    }
});

app.post("/cart/remove/:id", (req, res) => {
    const cart = req.session.cart || {};
    delete cart[req.params.id];
    req.session.cart = cart;
    res.redirect("/cart");
});

app.post("/cart/update/:id", (req, res) => {
    const cart = req.session.cart || {};

    if (cart[req.params.id] !== undefined) {
        const quantity = parseInt(req.body.quantity, 10);

        if (!Number.isFinite(quantity) || quantity < 1) {
            delete cart[req.params.id];
        } else {
            cart[req.params.id] = Math.min(quantity, 99);
        }
    }

    req.session.cart = cart;
    res.redirect("/cart");
});

app.post("/checkout/buy-now/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).send("Book not found.");
        }

        req.session.pendingCheckout = {
            mode: "single",
            items: [{
                bookId: book._id.toString(),
                quantity: 1
            }]
        };

        res.redirect("/checkout/payment");
    } catch (err) {
        console.log("Buy Now error:", err);
        res.status(500).send("Unable to start checkout.");
    }
});

app.post("/checkout", async (req, res) => {
    try {
        const cart = req.session.cart || {};

        if (Object.keys(cart).length === 0) {
            return res.redirect("/cart");
        }

        req.session.pendingCheckout = {
            mode: "cart",
            items: Object.entries(cart).map(([bookId, quantity]) => ({
                bookId,
                quantity: Math.max(1, Math.min(99, Number(quantity) || 1))
            }))
        };

        res.redirect("/checkout/payment");
    } catch (err) {
        console.log("Checkout error:", err);
        res.status(500).send("Unable to start checkout.");
    }
});

app.get("/checkout/payment", async (req, res) => {
    try {
        const pending = req.session.pendingCheckout;

        if (!pending || !pending.items || pending.items.length === 0) {
            return res.redirect("/cart");
        }

        const cartForCheckout = {};

        for (const item of pending.items) {
            cartForCheckout[item.bookId] = item.quantity;
        }

        const items = await getCartItems(cartForCheckout);
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);

        if (items.length === 0) {
            delete req.session.pendingCheckout;
            return res.redirect("/cart");
        }

        res.render("checkout.ejs", {
            page: "payment",
            items,
            total,
            orderItems: [],
            orderTotal: 0
        });
    } catch (err) {
        console.log("Payment page error:", err);
        res.status(500).send("Unable to load the payment page.");
    }
});

app.post("/checkout/payment", async (req, res) => {
    try {
        const pending = req.session.pendingCheckout;

        if (!pending || !pending.items || pending.items.length === 0) {
            return res.redirect("/cart");
        }

        const cartForCheckout = {};

        for (const item of pending.items) {
            if (mongoose.isValidObjectId(item.bookId)) {
                cartForCheckout[item.bookId] =
                    Math.max(1, Math.min(99, Number(item.quantity) || 1));
            }
        }

        const items = await getCartItems(cartForCheckout);

        if (items.length === 0) {
            delete req.session.pendingCheckout;
            return res.redirect("/cart");
        }

        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const orderItems = items;
        const orderTotal = total;
        const orderNumber = "EU-" + Date.now().toString().slice(-8);

        if (pending.mode === "cart") {
            req.session.cart = {};
        }

        delete req.session.pendingCheckout;

        res.render("checkout.ejs", {
            page: "success",
            items: [],
            total: 0,
            orderItems,
            orderTotal,
            orderNumber
        });
    } catch (err) {
        console.log("Mock payment error:", err);
        res.status(500).send("Unable to complete the demo order.");
    }
});
