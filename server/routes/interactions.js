import express from 'express';
import Interaction from '../models/Interaction.js';

const router = express.Router();

// POST /api/interactions
router.post('/', async (req, res) => {
  const { movieId } = req.body;

  if (typeof movieId !== 'number') {
    return res.status(400).json({ error: 'movieId must be a number' });
  }

  try {
    const interaction = await Interaction.create({ movieId });
    return res.json({ success: true, data: interaction });
  } catch (error) {
    console.error('Error creating interaction:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/interactions
router.get('/', async (req, res) => {
  try {
    const interactions = await Interaction.find().sort({ timestamp: -1 }).limit(100);
    return res.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
