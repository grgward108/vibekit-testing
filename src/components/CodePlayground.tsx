import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { templates } from '../utils/templates'
import { useVibekit } from '../hooks/useVibekit'
import PromptInput from './PromptInput'
import CodeOutput from './CodeOutput'

interface CodePlaygroundProps {
  activeTemplate: string | null
}

const CodePlayground = ({ activeTemplate }: CodePlaygroundProps) => {
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [sandboxId, setSandboxId] = useState<string | undefined>()
  const { generateCode, isLoading, error } = useVibekit()

  useEffect(() => {
    if (activeTemplate) {
      const template = templates.find(t => t.id === activeTemplate)
      if (template) {
        setPrompt(template.prompt)
        setSelectedLanguage(template.language)
      }
    }
  }, [activeTemplate])

  const handleGenerateCode = async () => {
    const result = await generateCode(prompt, selectedLanguage)
    if (result.success) {
      setGeneratedCode(result.code)
      setSandboxId(result.sandboxId)
    }
  }


  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          <p className="font-medium">Error generating code:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        onGenerate={handleGenerateCode}
        isGenerating={isLoading}
      />
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-700 px-4 py-2 text-sm font-medium">
          Generated Code
        </div>
        <div className="h-[500px]">
          <Editor
            height="100%"
            language={selectedLanguage}
            theme="vs-dark"
            value={generatedCode}
            onChange={(value) => setGeneratedCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false
            }}
          />
        </div>
      </div>
      
      {generatedCode && (
        <CodeOutput code={generatedCode} language={selectedLanguage} sandboxId={sandboxId} />
      )}
    </div>
  )
}

export default CodePlayground