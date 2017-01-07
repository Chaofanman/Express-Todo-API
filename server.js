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
		}, (err) => {
			return res.status(500).send();	
		});
});

app.get('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId)
		.then((matchedTodo) => {
			if (matchedTodo) {
				res.json(matchedTodo.toJSON());
			} else {
				return res.status(404).json({
					"error": "Todo with id " + todoId + " was not found"
				})
			}
		}, (error) => {
			return res.status(500).send();
		});
});

app.post('/todos', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body)
		.then((todo) => {
			res.json(todo.toJSON()); 
		}, (error) => {
			res.status(400).json(error);
		});
});

app.delete('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var todoToDelete = _.findWhere(todos, {id: todoId});

	if (!todoToDelete){
		return res.status(400).json({
			"error": "Todo with id " + todoId + " was not found" 
		});
	} else {
		todos = _.without(todos, todoToDelete);
		res.json(todoToDelete);
	}	
});

app.put('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});	
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).json({
			"error": "Todo with id " + todoId + " was not found"
		})
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).json({
			error: "Completed attribute error"
		});
	} 

	if (body.hasOwnProperty('description') && _.isString(body.description) &&  body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')){
		return res.status(400).json({
			error: "Description attribute error"
		});
	}

	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);
});

db.sequelize.sync()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Express listening on port ${PORT}`)
		});
	});

