const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (user) => user.username === username
  );

  if(!user) {
    return response.status(400).json({ error: 'User not found' });
  };

  request.user = user;

  return next();

};

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.some(
    (user) => user.username === username,
  );

  if(userExist) {
    return response.status(400).json({ error: 'User already exists'})
  };

  const createdUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(createdUser);

  return response.status(201).json(createdUser);

});

app.use(checksExistsUserAccount);

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const createdTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(createdTodo);

  return response.status(201).json(createdTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  let userIdTodo = user.todos.find(
    (todo) => todo.id === id,
  )

  if(!userIdTodo) {
    return response.status(404).json({ error: "Not found todo" })
  }

  userIdTodo = {
    ...userIdTodo,
    title,
    deadline: new Date(deadline)
  }

  return response.status(201).json(userIdTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let userIdTodo = user.todos.find(
    (todo) => todo.id === id,
  )

  if(!userIdTodo) {
    return response.status(404).json({ error: "Not found id todo" })
  }

  userIdTodo = {
    ...userIdTodo,
    done: true
  }

  return response.status(201).json(userIdTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userIdTodo = user.todos.find(
    (todo) => todo.id === id,
  )

  if(!userIdTodo) {
    return response.status(404).json({ error: "Not found id todo" })
  }

  user.todos.splice(userIdTodo, 1);

  return response.status(204).send();

});

module.exports = app;