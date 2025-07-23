import { useState } from 'react'
// import { VibeKit } from '@vibe-kit/sdk' // SDK is Node.js only, not browser compatible

interface ViberkitConfig {
  agentType?: 'codex' | 'claude'
  provider?: 'azure' | 'openai' | 'anthropic'
  apiKey?: string
  model?: string
}

export const useVibekit = (config: ViberkitConfig = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = async (prompt: string, language: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Since Vibekit SDK is Node.js only, we'll call your backend API
      // In a real implementation, you'd have a backend that uses the Vibekit SDK
      
      const enhancedPrompt = `Generate ${language} code for: ${prompt}. 
        Please provide clean, well-commented code that follows best practices for ${language}.`
      
      // Call to your backend API that uses Vibekit SDK
      const response = await fetch('http://localhost:3002/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          language,
          agentType: config.agentType || 'codex',
          provider: config.provider || 'azure'
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      
      setIsLoading(false)
      return {
        success: true,
        code: result.code || 'No code generated',
        explanation: 'Generated using Vibekit SDK via backend API',
        sandboxId: result.sandboxId
      }
    } catch (err) {
      console.error('Vibekit API error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate code')
      setIsLoading(false)
      return {
        success: false,
        code: '',
        explanation: ''
      }
    }
  }

  return {
    generateCode,
    isLoading,
    error
  }
}

