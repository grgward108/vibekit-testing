import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VibeKit } from '@vibe-kit/sdk';
import { createE2BProvider } from '@vibe-kit/e2b';

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

// Get files from sandbox endpoint
app.get('/api/sandbox/:sandboxId/files', async (req, res) => {
  try {
    const { sandboxId } = req.params;
    
    // Actually connect to the E2B sandbox and get the real files
    const { Sandbox } = await import('@e2b/code-interpreter');
    
    // Connect to the existing sandbox
    const sandbox = await Sandbox.reconnect(sandboxId, {
      apiKey: process.env.E2B_API_KEY
    });
    
    // List all files in the sandbox
    const filesResult = await sandbox.runCode('find /vibe0 -type f -name "*.ts" -o -name "*.json" | head -20');
    
    if (filesResult.error) {
      throw new Error(`Failed to list files: ${filesResult.error}`);
    }
    
    const filePaths = filesResult.stdout.trim().split('\n').filter(path => path.trim());
    const files = {};
    
    // Read each file's content
    for (const filePath of filePaths) {
      const fileName = filePath.split('/').pop();
      const fileContent = await sandbox.runCode(`cat "${filePath}"`);
      
      if (!fileContent.error && fileContent.stdout) {
        files[fileName] = {
          path: filePath,
          content: fileContent.stdout
        };
      }
    }
    
    await sandbox.close();
    
    res.json({
      success: true,
      sandboxId,
      files,
      message: `Retrieved ${Object.keys(files).length} files from sandbox`
    });
  } catch (error) {
    console.error('Error getting sandbox files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sandbox files',
      details: error.message
    });
  }
});

// Code generation endpoint
app.post('/api/generate-code', async (req, res) => {
  try {
    const { prompt, language, agentType = 'claude', provider = 'anthropic' } = req.body;

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

    // Create E2B provider using the official Vibekit method
    const e2bProvider = createE2BProvider({
      apiKey: process.env.E2B_API_KEY,
      templateId: "vibekit-claude", // Use the claude-specific template
    });

    // Initialize Vibekit with proper Azure configuration
    const vibekit = new VibeKit()
      .withAgent({
        type: agentType,
        provider: provider,  // 'anthropic'
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-5-haiku-20241022'
      })
      .withSandbox(e2bProvider)
      .withSecrets({
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        E2B_API_KEY: process.env.E2B_API_KEY
      });

    // Add event listeners for better debugging
    vibekit.on("update", (data) => console.log("📈 Update:", data));
    vibekit.on("error", (error) => console.log("💥 Error:", error));

    // Enhanced prompt for better code generation
    const enhancedPrompt = `Generate ${language} code for: ${prompt}

Please provide:
1. Clean, well-commented code that follows best practices
2. Proper error handling where appropriate
3. Type definitions if using TypeScript
4. Export statements for reusability

Focus on creating production-ready code.`;

    console.log('📡 Calling Vibekit generateCode...');

    // Generate code using Vibekit with Claude
    const response = await vibekit.generateCode({
      prompt: enhancedPrompt,
      mode: 'code'  // Use 'code' mode with Claude
    });

    console.log('✅ Vibekit response received:', {
      exitCode: response.exitCode,
      stdoutLength: response.stdout?.length || 0,
      stderrLength: response.stderr?.length || 0,
      sandboxId: response.sandboxId
    });

    // Parse the Vibekit stdout to extract meaningful content
    let extractedCode = 'No code generated';
    
    if (response.stdout) {
      try {
        // The stdout contains a mix of JSON messages and final content
        // We want to extract the final assistant response
        const lines = response.stdout.split('\n');
        let finalContent = '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              // Try to parse as JSON to see if it's a message
              const parsed = JSON.parse(line);
              
              // Look for assistant messages with actual content
              if (parsed.type === 'assistant' && parsed.message && parsed.message.content) {
                for (const content of parsed.message.content) {
                  if (content.type === 'text' && content.text) {
                    finalContent += content.text + '\n';
                  }
                }
              }
              
              // Also look for the final result message
              if (parsed.type === 'result' && parsed.result) {
                finalContent += parsed.result + '\n';
              }
              
            } catch (jsonError) {
              // If it's not JSON, it might be plain text output
              // Skip empty lines and very short lines
              if (line.length > 10 && !line.startsWith('{')) {
                finalContent += line + '\n';
              }
            }
          }
        }
        
        // If we found meaningful content, use it
        if (finalContent.trim()) {
          extractedCode = finalContent.trim();
        } else {
          // If no structured content found, show a summary
          extractedCode = 'Code generation completed. Click "Get Real Files" to view the generated files.';
        }
        
      } catch (error) {
        console.error('Error parsing Vibekit response:', error);
        extractedCode = 'Code generation completed. Raw output available in logs.';
      }
    }

    // Send response back to frontend
    res.json({
      success: true,
      code: extractedCode,
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
  console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅' : '❌');
  console.log('- E2B_API_KEY:', process.env.E2B_API_KEY ? '✅' : '❌');
});