import express from 'express';
import bodyParser from 'body-parser';
import prdRoutes from './routes/prd';
import marketResearchRoutes from './routes/marketResearch';
import prototypeRoutes from './routes/prototype';
import toolsRoutes from './routes/tools';

import prfaqRoutes from './routes/prfaq';


const app = express();
app.use(bodyParser.json());

app.use('/prd', prdRoutes);
app.use('/market_research', marketResearchRoutes);
app.use('/prototype', prototypeRoutes);
app.use('/tools', toolsRoutes);
app.use('/pr_faq', prfaqRoutes);



const PORT = 3000;
app.listen(PORT, () => console.log(`MCP server running on port ${PORT}`));