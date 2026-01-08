const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'super_tajny_klucz_projektu_angular';
const DB_FILE = './db.json';

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();

  const user = db.users.find(u => u.email === email && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    console.log(`Zalogowano: ${user.name}`);
    const { password, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } else {
    res.status(401).json({ message: 'Błędny email lub hasło' });
  }
});

app.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  const db = readDb();

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Taki email już istnieje!' });
  }

  const newUser = {
    id: Date.now(),
    email,
    password,
    name: name || 'Nowy Użytkownik',
    avatarColor: 'bg-secondary'
  };

  db.users.push(newUser);
  writeDb(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, user: newUser });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader) {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) { console.log("Token nieważny"); }
      else { console.log("Token OK:", decoded.name); }
    });
  }
  next();
}

app.get('/posts', verifyToken, (req, res) => {
  res.json(readDb().posts);
});

app.post('/posts', verifyToken, (req, res) => {
  const db = readDb();
  const newPost = { id: Date.now(), ...req.body };
  db.posts.push(newPost);
  writeDb(db);
  res.json(newPost);
});

app.get('/users', (req, res) => res.json(readDb().users));
app.get('/conversations', (req, res) => res.json(readDb().conversations || []));

app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
