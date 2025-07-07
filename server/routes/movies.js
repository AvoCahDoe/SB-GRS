import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().limit(200).sort({ release_date:-1 });
    console.log('Fetched movies:', movies.length);
    res.json(movies);
  } catch (err) {
    console.error('Failed to fetch movies:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:imdb_id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ imdb_id: req.params.imdb_id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
