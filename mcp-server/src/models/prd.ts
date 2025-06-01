export type PRD = {
  id: string;
  title: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    owner: string;
    status: 'draft' | 'review' | 'final';
    tags: string[];
  };
  content: {
    overview: string;
    problem_statement: string;
    goals: string[];
    requirements: string[];
    success_metrics: string[];
  };
};