import express, { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../store/inMemoryStore';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  const id = uuid();
  const now = new Date().toISOString();
  const doc = { ...req.body, id, createdAt: now, updatedAt: now };
  store.market_research.set(id, doc);
  res.status(201).json(doc);
});

export default router;
