var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API Root');
});

app.get('/todos', (req, res) => {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where})
		.then((todos) => {
			res.json(todos);
		})
		.catch((err) => {
			res.status(500).send(err);	
		});
});

app.get('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId)
		.then((matchedTodo) => {
			if (matchedTodo) {
				res.json(matchedTodo.toJSON());
			} else {
					res.status(404).json({
						"error": "Todo with id " + todoId + " was not found"
					})
				}
			})
		.catch((err) => {
			res.status(500).send(err);
		});
});

app.post('/todos', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body)
		.then((todo) => {
			res.json(todo.toJSON()); 
		})
		.catch((err) => {
			res.status(400).json(err);
		});
});

app.delete('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	})
	.then((rowsDeleted) => {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "No todo with id " + todoId
			});
		} else {
			res.json(204).send();
		}
	}) 
	.catch((err) => {
		res.status(500).send(err);
	});
});

app.put('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} 
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId)
		.then((todo) => {
			if (todo) { 
				return todo.update(attributes);
			} else {
				res.status(404).json({
					"error": "No todo with id " + todoId
				});
			}
		})
		.catch((err) => {
			res.status(500).send(err);
		})
		.then((updatedTodo) => {
			res.json(updatedTodo.toJSON());
		})
		.catch((err) => {
			res.status(400).json(err);
		});
});

app.post('/users', (req, res) => {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body)
		.then((user) => {
			res.json(user.toPublicJSON());
		})
		.catch((err) => {
			res.status(400).json(err);
		})
});

db.sequelize.sync()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Express listening on port ${PORT}`)
		});
	});

