import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VibeKit } from '@vibe-kit/sdk';
import pkg from '@e2b/code-interpreter';
const { CodeInterpreter } = pkg;

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vibekit backend is running!' });
});

// Code generation endpoint
app.post('/api/generate-code', async (req, res) => {
  try {
    const { prompt, language, agentType = 'codex', provider = 'azure' } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required' 
      });
    }

    console.log('🚀 Generating code with Vibekit SDK...');
    console.log('Prompt:', prompt);
    console.log('Language:', language);
    console.log('Agent Type:', agentType);
    console.log('Provider:', provider);

    // Create E2B sandbox provider
    const e2bProvider = {
      async create(envs = {}, agentType, workingDirectory = '/tmp') {
        console.log('🏗️  Creating E2B sandbox...');
        const sandbox = await CodeInterpreter.create({
          apiKey: process.env.E2B_API_KEY,
          template: 'base',
          metadata: { agentType }
        });
        
        return {
          sandboxId: sandbox.sandboxId,
          commands: {
            async run(command, options = {}) {
              console.log('🔧 Running command:', command);
              const result = await sandbox.runCode(command);
              return {
                exitCode: result.error ? 1 : 0,
                stdout: result.stdout || '',
                stderr: result.stderr || result.error?.message || ''
              };
            }
          },
          async kill() {
            await sandbox.close();
          },
          async pause() {
            // E2B doesn't support pause, just log it
            console.log('⏸️  Pause requested (not supported by E2B)');
          },
          async getHost(port) {
            return `${sandbox.sandboxId}.e2b.dev:${port}`;
          }
        };
      },
      async resume(sandboxId) {
        console.log('🔄 Resuming sandbox:', sandboxId);
        // E2B doesn't support resume, create new one
        return this.create();
      }
    };

    // Initialize Vibekit
    const vibekit = new VibeKit();

    // Configure with your credentials
    vibekit
      .withAgent({
        type: agentType,
        provider: provider,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        model: process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4'
      })
      .withSandbox(e2bProvider)
      .withSecrets({
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
        E2B_API_KEY: process.env.E2B_API_KEY
      })
      .withTelemetry({
        enabled: true,
        sessionId: `session-${Date.now()}`
      });

    // Enhanced prompt for better code generation
    const enhancedPrompt = `Generate ${language} code for: ${prompt}

Please provide:
1. Clean, well-commented code that follows best practices
2. Proper error handling where appropriate
3. Type definitions if using TypeScript
4. Export statements for reusability

Focus on creating production-ready code.`;

    console.log('📡 Calling Vibekit generateCode...');

    // Generate code using Vibekit
    const response = await vibekit.generateCode({
      prompt: enhancedPrompt,
      mode: 'code'
    });

    console.log('✅ Vibekit response received:', {
      exitCode: response.exitCode,
      stdoutLength: response.stdout?.length || 0,
      stderrLength: response.stderr?.length || 0,
      sandboxId: response.sandboxId
    });

    // Send response back to frontend
    res.json({
      success: true,
      code: response.stdout || 'No code generated',
      stderr: response.stderr,
      exitCode: response.exitCode,
      sandboxId: response.sandboxId,
      metadata: {
        language,
        agentType,
        provider,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generating code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate code',
      details: error.stack
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Vibekit backend server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Code generation: http://localhost:${PORT}/api/generate-code`);
  console.log('');
  console.log('Environment variables loaded:');
  console.log('- AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? '✅' : '❌');
  console.log('- AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? '✅' : '❌');
  console.log('- AZURE_DEPLOYMENT_NAME:', process.env.AZURE_DEPLOYMENT_NAME ? '✅' : '❌');
  console.log('- E2B_API_KEY:', process.env.E2B_API_KEY ? '✅' : '❌');
});