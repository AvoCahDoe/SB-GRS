import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema({
  id: Number,
  name: String,
}, { _id: false });

const movieSchema = new mongoose.Schema({
  adult: String,
  belongs_to_collection: String,
  budget: Number,
  genres: [genreSchema],
  homepage: String,
  id: Number,
  imdb_id: String,
  original_language: String,
  original_title: String,
  overview: String,
  popularity: Number,
  poster_path: String,
  release_date: String,
  revenue: Number,
  runtime: Number,
  status: String,
  tagline: String,
  title: String,
  video: String,
  vote_average: Number,
  vote_count: Number,
}, { collection: 'movies' });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
