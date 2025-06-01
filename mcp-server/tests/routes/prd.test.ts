import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import prdRoutes from '../../src/routes/prd';

const app = express();
app.use(bodyParser.json());
app.use('/prd', prdRoutes);

describe('PRD Resource API', () => {
  it('should create and retrieve a PRD', async () => {
    const sample = {
      title: 'Test PRD',
      version: '1.0',
      metadata: {
        owner: 'pm@example.com',
        status: 'draft',
        tags: ['alpha']
      },
      content: {
        overview: '...',
        problem_statement: '...',
        goals: ['...'],
        requirements: ['...'],
        success_metrics: ['...']
      }
    };

    const createRes = await request(app).post('/prd').send(sample);
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();

    const getRes = await request(app).get(`/prd/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe('Test PRD');
  });
});