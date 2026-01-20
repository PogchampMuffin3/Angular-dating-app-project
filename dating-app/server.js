const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'klucz';
const DB_FILE = './db.json';



function readDb() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

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

// Endpoint: Logowanie
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();

  // Szukamy użytkownika
  const user = db.users.find(u => u.email === email && u.password === password);

  if (user) {
    // Tworzymy token
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ message: 'Błędny email lub hasło' });
  }
});


// Endpoint: Rejestracja
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



// Endpoint: Pobierz listę użytkowników
app.get('/users', verifyToken, (req, res) => {
  const db = readDb();
  // Zwracamy wszystkich oprócz nas samych
  res.json(db.users);
});

app.get('/messages/:friendId', verifyToken, (req, res) => {
  const db = readDb();
  const friendId = parseInt(req.params.friendId);

  const token = req.headers['authorization'].split(' ')[1];
  const myId = jwt.verify(token, SECRET_KEY).id;

  // Filtrowanie
  const chat = db.messages.filter(m =>
    (m.fromId === myId && m.toId === friendId) ||
    (m.fromId === friendId && m.toId === myId)
  );

  res.json(chat);
});


// Endpoint: Wyślij wiadomość
app.post('/messages', verifyToken, (req, res) => {
  try {
    const db = readDb();
    const { toId, content } = req.body;

    const token = req.headers['authorization'].split(' ')[1];
    const myId = jwt.verify(token, SECRET_KEY).id;

    if (!db.messages) db.messages = [];

    const newMessage = {
      id: Date.now(),
      fromId: myId,
      toId: parseInt(toId),
      content: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.messages.push(newMessage);
    writeDb(db); // Zapisz do pliku

    res.json(newMessage);
  } catch (e) {
    console.error("Błąd wysyłania:", e);
    res.status(500).json({ error: e.message });
  }
});


// Endpoint: Polub post
app.post('/posts/:id/like', verifyToken, (req, res) => {
  const db = readDb();
  const postId = req.params.id;
  const token = req.headers['authorization'].split(' ')[1];
  const myId = jwt.verify(token, SECRET_KEY).id;
  const post = db.posts.find(p => p.id == postId);
  if (!post) {
    return res.status(404).json({ message: "Post nie znaleziony" });
  }

  if (!post.likedBy) {
    post.likedBy = [];
  }

  const index = post.likedBy.indexOf(myId);

  if (index === -1) {
    post.likedBy.push(myId);
  } else {
    post.likedBy.splice(index, 1);
  }
  post.likes = post.likedBy.length;

  writeDb(db);
  res.json(post);
});




app.get('/users', (req, res) => res.json(readDb().users));
app.get('/conversations', (req, res) => res.json(readDb().conversations || []));

app.get('/users/:id', (req, res) => {
  try {
    const db = readDb(); // <--- TEGO BRAKOWAŁO!
    const userId = req.params.id; // Pobieramy jako string

    // Szukamy używając == (miękkie porównanie: "3" == 3)
    const user = db.users.find(u => u.id == userId);

    if (user) {
      // Usuwamy hasło przed wysłaniem
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } else {
      console.log(`[404] Nie znaleziono użytkownika o ID: ${userId}`);
      res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }
  } catch (e) {
    console.error("Błąd serwera przy pobieraniu usera:", e);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
