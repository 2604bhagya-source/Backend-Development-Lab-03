# Backend Development Lab – 03

## Student Details

| Detail | Information |
|---|---|
| **Name** | Bhagyasri |
| **Registration Number** | 252U1R5108 |
| **Course** | B.Tech – Computer Science and Engineering (AI&DE) |
| **Year / Term** | Year II – Term II |
| **Section** | S-011 |
| **College** | Aurora Higher Education and Research Academy |
| **Faculty** | Mr. Yugandhar Gurjalwar |
| **Academic Year** | 2025–2026 |

---

## Experiment Title

**REST API, Query Parameters, Validation and Debugging**

## Project Description

This project implements a Book Management REST API using Node.js, Express.js and SQLite.

The API allows users to create, retrieve, update and delete book records. It also supports searching, sorting, pagination and filtering using query parameters.

## Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Postman
- Git and GitHub

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Retrieve all books |
| GET | `/books/:id` | Retrieve a book by ID |
| POST | `/books` | Create a new book |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

## Query Parameters

- `search_q` – Search books by title
- `order_by` – Sort by title, author, price or ID
- `order` – ASC or DESC
- `limit` – Set the number of records
- `offset` – Skip records
- `min_price` – Filter by minimum price
- `max_price` – Filter by maximum price

## How to Run the Project

1. Clone this repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open Postman and test the API using:

   ```text
   http://localhost:3000/books
   ```

## Screenshots

Postman testing screenshots are available in the `screenshots` folder.

## Learning Outcomes

- Understanding REST API development.
- Creating CRUD operations using Express.js.
- Connecting Node.js with SQLite.
- Implementing query parameters.
- Validating user inputs.
- Handling HTTP status codes and errors.
- Testing APIs using Postman.
- Managing source code using Git and GitHub.
