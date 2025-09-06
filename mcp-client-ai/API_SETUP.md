# 🔑 API Keys Setup Guide

## Required API Keys

To use the Agentic PM platform with multi-model evaluation, you'll need API keys from the following providers:

### 1. OpenAI (Required)
- **Models**: GPT-4, GPT-5 (when available)
- **Get API Key**: https://platform.openai.com/api-keys
- **Environment Variable**: `OPENAI_API_KEY`
- **Pricing**: ~$0.01-0.06 per 1K tokens

### 2. Anthropic Claude (Optional but Recommended)
- **Models**: Claude-3-Opus, Claude-3-Sonnet, Claude-3-Haiku
- **Get API Key**: https://console.anthropic.com/
- **Environment Variable**: `ANTHROPIC_API_KEY`
- **Pricing**: ~$0.00025-0.075 per 1K tokens

## Setup Instructions

### Step 1: Copy Environment File
```bash
cp .env.example .env
```

### Step 2: Add Your API Keys
Edit the `.env` file:

```bash
# Required - OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Optional - Anthropic Claude (for multi-model evaluation)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Optional - GPT-5 (when available)
GPT5_ENABLED=false
```

### Step 3: Test Your Setup
```bash
cd mcp-client-ai
npm install
npx ts-node src/examples/genericProductExample.ts
```

## Available Models by Provider

### OpenAI Models
- `gpt-4`: GPT-4 Turbo (recommended for most tasks)
- `gpt-5`: GPT-5 (when available, set GPT5_ENABLED=true)

### Anthropic Models
- `claude-3-opus`: Most capable, highest cost
- `claude-3-sonnet`: Balanced performance and cost (recommended)
- `claude-3-haiku`: Fastest, lowest cost

## Cost Estimation

For a typical product analysis workflow:

| Component | Tokens | GPT-4 Cost | Claude-3-Sonnet Cost |
|-----------|---------|------------|---------------------|
| PRD Generation | ~3,000 | $0.18 | $0.045 |
| Market Research | ~3,500 | $0.21 | $0.053 |
| Competitive Analysis | ~3,500 | $0.21 | $0.053 |
| Evaluation (per model) | ~4,000 | $0.24 | $0.060 |
| **Total (single model)** | ~14,000 | **$0.84** | **$0.21** |
| **Total (multi-model eval)** | ~18,000 | **$1.32** | **$0.33** |

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** (monthly recommended)
4. **Set usage limits** in provider dashboards
5. **Monitor usage** to detect anomalies

## Troubleshooting

### Common Issues

**Error: "OPENAI_API_KEY environment variable is missing"**
- Ensure `.env` file exists and contains valid API key
- Check that key starts with `sk-` for OpenAI

**Error: "No AI models available for evaluation"**
- At least one API key (OpenAI or Anthropic) must be configured
- Test connectivity with the test function

**Error: "Rate limit exceeded"**
- Wait a few minutes and try again
- Consider upgrading your API plan
- Reduce concurrent requests

### Testing API Connectivity
```typescript
import { MultiModelAI } from './src/services/MultiModelAI';

const ai = new MultiModelAI();
const results = await ai.testConnectivity();
console.log('Available models:', results);
```

## Support

If you encounter issues with API setup:
1. Check the provider's status page
2. Verify your API key permissions
3. Review usage limits and billing
4. Test with a simple API call first

## Cost Optimization Tips

1. **Use Claude-3-Sonnet** for evaluation (lower cost, good quality)
2. **Limit evaluation models** to 2-3 for most analyses
3. **Set monthly budgets** in provider dashboards
4. **Cache results** for repeated analyses
5. **Use shorter prompts** when possible