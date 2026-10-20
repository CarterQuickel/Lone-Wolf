const express = require('express');
const path = require('path');
const fs = require('fs');

// get all paths
const choicesPath = './Paths';
const pathJSON = [];
fs.readdir(choicesPath, (err, f) => {
  if (err) throw err;
  const files = f.filter(fil => path.extname(fil) === '.htm');
  files.forEach(fil => {
    const filePath = path.join(choicesPath, fil);
    const content = fs.readFileSync(filePath, 'utf8');
    pathJSON.push(fil);
  });
});

// startup data
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/Paths', express.static(path.join(__dirname, 'Paths')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Choose a Path',
    message: 'Testing!',
    list: pathJSON
  });
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
