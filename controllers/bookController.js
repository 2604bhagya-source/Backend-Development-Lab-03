const { db } = require("../database/db");

const allowedOrderByFields = ["title", "author", "price", "id"];
const allowedOrders = ["ASC", "DESC"];

const getAllBooks = async (req, res, next) => {
  try {
    const {
      search_q = "",
      order_by = "title",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = req.query;

    if (typeof search_q !== "string") {
      return res.status(400).json({ message: "search_q must be a string" });
    }

    const normalizedOrderBy = String(order_by).toLowerCase();
    if (!allowedOrderByFields.includes(normalizedOrderBy)) {
      return res.status(400).json({
        message: "order_by must be one of: title, author, price, id",
      });
    }

    const normalizedOrder = String(order).toUpperCase();
    if (!allowedOrders.includes(normalizedOrder)) {
      return res.status(400).json({ message: "order must be ASC or DESC" });
    }

    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ message: "limit must be a positive integer" });
    }

    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ message: "offset must be a non-negative integer" });
    }

    let minPriceValue = null;
    if (min_price !== undefined) {
      minPriceValue = Number(min_price);
      if (!Number.isFinite(minPriceValue) || minPriceValue < 0) {
        return res.status(400).json({ message: "min_price must be a non-negative number" });
      }
    }

    let maxPriceValue = null;
    if (max_price !== undefined) {
      maxPriceValue = Number(max_price);
      if (!Number.isFinite(maxPriceValue) || maxPriceValue < 0) {
        return res.status(400).json({ message: "max_price must be a non-negative number" });
      }
    }

    if (minPriceValue !== null && maxPriceValue !== null && minPriceValue > maxPriceValue) {
      return res.status(400).json({
        message: "min_price cannot be greater than max_price",
      });
    }

    let sql = "SELECT * FROM books WHERE 1 = 1";
    const params = [];

    if (search_q.trim() !== "") {
      sql += " AND title LIKE ?";
      params.push(`%${search_q}%`);
    }

    if (minPriceValue !== null) {
      sql += " AND price >= ?";
      params.push(minPriceValue);
    }

    if (maxPriceValue !== null) {
      sql += " AND price <= ?";
      params.push(maxPriceValue);
    }

    sql += ` ORDER BY ${normalizedOrderBy} ${normalizedOrder}`;
    sql += " LIMIT ? OFFSET ?";
    params.push(parsedLimit, parsedOffset);

    const books = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });

    return res.status(200).json({
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const validateBookData = (title, author, price) => {
  if (typeof title !== "string" || title.trim() === "") {
    return "Title is required";
  }

  if (typeof author !== "string" || author.trim() === "") {
    return "Author is required";
  }

  const numericPrice = Number(price);

  if (price === undefined || price === null || price === "") {
    return "Price is required";
  }

  if (!Number.isFinite(numericPrice)) {
    return "Price must be numeric";
  }

  if (numericPrice < 0) {
    return "Price cannot be negative";
  }

  return null;
};

const createBook = async (req, res, next) => {
  try {
    const { title, author, price } = req.body || {};
    const validationError = validateBookData(title, author, price);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const newBook = {
      title: title.trim(),
      author: author.trim(),
      price: Number(price),
    };

    const result = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO books (title, author, price) VALUES (?, ?, ?)",
        [newBook.title, newBook.author, newBook.price],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          resolve(this.lastID);
        }
      );
    });

    const createdBook = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM books WHERE id = ?", [result], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });

    return res.status(201).json({
      message: "Book created successfully",
      data: createdBook,
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const { title, author, price } = req.body || {};
    const validationError = validateBookData(title, author, price);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingBook = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?",
        [title.trim(), author.trim(), Number(price), id],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        }
      );
    });

    const updatedBook = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });

    return res.status(200).json({
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const existingBook = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await new Promise((resolve, reject) => {
      db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });

    return res.status(200).json({
      message: "Book deleted successfully",
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
