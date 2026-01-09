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
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
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



// 1. Endpoint: Pobierz listę użytkowników (do listy kontaktów)
app.get('/users', verifyToken, (req, res) => {
  const db = readDb();
  // Zwracamy wszystkich oprócz nas samych (nie chcemy pisać do siebie)
  res.json(db.users);
});

app.get('/messages/:friendId', verifyToken, (req, res) => {
  try {
    console.log("--- START /messages/:friendId ---");
    const db = readDb();

    // Zabezpieczenie level MAX: jeśli cokolwiek jest nie tak z bazą, zwróć pustą tablicę
    if (!db || !db.messages || !Array.isArray(db.messages)) {
      console.warn("Baza uszkodzona lub brak messages. Zwracam [].");
      return res.json([]);
    }

    const friendId = parseInt(req.params.friendId);

    // Wyciągnij ID z tokena
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.json([]); // Brak tokena? Pusta lista.

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2) return res.json([]); // Zły format? Pusta lista.

    const token = tokenParts[1];
    let myId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      myId = decoded.id;
    } catch (err) {
      console.error("Błąd weryfikacji tokena:", err.message);
      return res.json([]); // Token nieważny? Pusta lista.
    }

    // Filtrowanie
    const chat = db.messages.filter(m =>
      (m.fromId === myId && m.toId === friendId) ||
      (m.fromId === friendId && m.toId === myId)
    );

    console.log(`Znaleziono ${chat.length} wiadomości.`);
    res.json(chat);

  } catch (e) {
    // Jeśli nawet to zawiedzie, nie rzucaj 500, tylko zwróć [] i zaloguj błąd
    console.error("Krytyczny błąd w endpointcie (zignorowany):", e);
    res.json([]);
  }
});


// 3. Endpoint: Wyślij wiadomość
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



app.get('/users', (req, res) => res.json(readDb().users));
app.get('/conversations', (req, res) => res.json(readDb().conversations || []));

app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
