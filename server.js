const express = require("express");
const { initializeDatabase } = require("./database/db");
const bookRoutes = require("./routes/bookRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Book Management API is running.",
  });
});

app.use("/books", bookRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
