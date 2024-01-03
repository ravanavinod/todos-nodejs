const express = require("express");
const app = express();
const path = require("path");
const addDays = require("date-fns/addDays");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "./todoApplication.db");
app.use(express.json());
let db = null;

const initializationDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(e.message);
  }
};
initializationDB();

const priorityArr = ["HIGH", "MEDIUM", "LOW"];
const statusArr = ["TO DO", "IN PROGRESS", "DONE"];
const categoryArr = ["WORK", "HOME", "LEARNING"];

app.get("/todos/", async (req, res) => {
  let { status = "", priority = "", category = "", search_q = "" } = req.query;

  if (status.length > 0 && !statusArr.includes(status)) {
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (priority.length > 0 && !priorityArr.includes(priority)) {
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (category.length > 0 && !categoryArr.includes(category)) {
    res.status(400);
    res.send("Invalid Todo Category");
  } else {
    let query = `select * from todo where status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND category LIKE '%${category}%' AND todo LIKE '%${search_q}%'`;
    console.log(query);
    let results = await db.all(query);
    res.status(200);
    res.send(results);
  }
});

app.get("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let query = `select * from todo where id = ${todoId}`;
  let results = await db.get(query);
  res.status(200);
  res.send(results);
});
app.get("/agenda/", async (req, res) => {
  let { date } = req.query;
  let dateObj = new Date(date);
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  let newDate = `${dateObj.getFullYear()}-${month}-${day}`;

  let result = await db.all(`select * from todo where due_date = '${newDate}'`);
  res.status(200);
  res.send(result);
});

app.post("/todos/", async (req, res) => {
  let { todo, priority, status, category, dueDate } = req.body;
  let query = `INSERT INTO todo (todo,priority,status,category,due_date) VALUES ('${todo}','${priority}','${status}','${category}','${dueDate}')`;

  let result = db.run(query);
  res.status(200);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (req, res) => {
  let { todoId } = req.params;
  let {
    todo = "",
    priority = "",
    status = "",
    category = "",
    dueDate = "",
  } = req.body;
  let query = null;
  let message = null;
  if (todo.length > 0) {
    query = `update todo SET todo = '${todo}' WHERE id = ${todoId}`;
    message = `Todo Updated`;
  }
  if (priority.length > 0) {
    query = `update todo SET priority = '${priority}' WHERE id = ${todoId}`;
    message = `Priority Updated`;
  }
  if (status.length > 0) {
    query = `update todo SET status = '${status}' WHERE id = ${todoId}`;
    message = `Status Updated`;
  }
  if (category.length > 0) {
    query = `update todo SET category = '${category}' WHERE id = ${todoId}`;
    message = `Category Updated`;
  }
  if (dueDate.length > 0) {
    query = `update todo SET due_date = '${dueDate}' WHERE id = ${todoId}`;
    message = `Due Date Updated`;
  }
  let result = await db.run(query);
  res.status(200);
  res.send(message);
});
app.delete("/todos/:todoId", async (req, res) => {
  let { todoId } = req.params;
  db.run(`DELETE FROM todo WHERE id = ${todoId}`);
  res.status(200);
  res.send("Todo Deleted");
});
module.exports = app;
