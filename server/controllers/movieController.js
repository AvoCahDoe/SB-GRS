import Movie from '../models/movieModel.js';

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find({}).sort({ release_date: 1}).limit(20);
    res.json(movies);
  } catch (error) {
    console.error('Error getting movies:', error);
    res.status(500).json({ message: 'Server error fetching movies' });
  }
};
