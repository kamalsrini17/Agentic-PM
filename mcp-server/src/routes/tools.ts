// src/routes/tools.ts
import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/validate_requirements', (req: Request, res: Response) => {
  const prd = req.body;

  const requiredFields = ['overview', 'problem_statement', 'goals', 'requirements', 'success_metrics'];
  const missingSections = requiredFields.filter(field => !prd.content[field] || prd.content[field].length === 0);

  res.json({
    completenessScore: (5 - missingSections.length) / 5,
    missingSections
  });
});

export default router;
