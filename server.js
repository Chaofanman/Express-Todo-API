var express = require('express');
var bodyParser = require('body-parser');


var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Start todo api',
	completed: true,
}, {
	id: 2,
	description: 'Commit to github',
	completed: false
}];

var globalTodoId = 3;

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API Root');
});

app.get('/todos', (req, res) => {
	res.json(todos);
});

app.get('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo;

	todos.forEach((todo) => {
		if (todoId === todo.id){
			matchedTodo = todo;
		}
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.err(404).send();
	}
})

app.post('/todos', (req, res) => {
	var newTodo = req.body;
	newTodo.id = globalTodoId++;
	todos.push(newTodo);
	res.json(newTodo);
})

app.listen(PORT, () => {
	console.log(`Express listeninng on port ${PORT}`)
});