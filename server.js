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
})

app.listen(PORT, () => {
	console.log(`Express listeninng on port ${PORT}`)
})