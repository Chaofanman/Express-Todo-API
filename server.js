var express = require('express');
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

app.listen(PORT, () => {
	console.log(`Express listeninng on port ${PORT}`)
});