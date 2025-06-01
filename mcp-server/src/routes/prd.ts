
import express, { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../store/inMemoryStore';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  const id = uuid();
  const now = new Date().toISOString();
  const prd = { ...req.body, id, createdAt: now, updatedAt: now };
  store.prd.set(id, prd);
  res.status(201).json(prd);
});

router.get('/:id', (req: Request, res: Response) => {
  const prd = store.prd.get(req.params.id);
  if (!prd) return res.status(404).json({ error: 'Not found' });
  res.json(prd);
});

export default router;

