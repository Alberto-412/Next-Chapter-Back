require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api.routes');

const app = express();

const corsOptions = {
  origin: ['http://localhost:4200', 'http://localhost:10200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Next Chapter funcionando 📚' });
});

app.listen(process.env.PORT || 10200, () => {
  console.log(`Servidor arrancado en puerto ${process.env.PORT || 10200}`);
});

