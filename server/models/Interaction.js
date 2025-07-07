import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Interaction = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);

export default Interaction;
