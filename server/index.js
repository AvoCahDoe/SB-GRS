import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import movieRoutes from './routes/movies.js';
import helmet from 'helmet';
import interactionsRouter from './routes/interactions.js';


const app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
    },
  })
);

app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb://localhost:27017/movies_app';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes placeholder
app.get('/', (req, res) => res.send('API is working'));


app.use('/api/movies', movieRoutes);
app.use('/api/movies/:imdb_id', movieRoutes);

app.use('/api/interactions', interactionsRouter);


app.get('/ping', (req, res) =>  res.send('pong'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
