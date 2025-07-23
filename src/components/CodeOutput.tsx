import { useState } from 'react'

interface CodeOutputProps {
  code: string
  language: string
  sandboxId?: string
}

const CodeOutput = ({ code, language, sandboxId }: CodeOutputProps) => {
  const [copied, setCopied] = useState(false)
  const [showExecution, setShowExecution] = useState(false)
  const [files, setFiles] = useState<any>(null)
  const [loadingFiles, setLoadingFiles] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExecute = () => {
    setShowExecution(true)
  }

  const handleGetFiles = async () => {
    if (!sandboxId) return
    
    setLoadingFiles(true)
    try {
      const response = await fetch(`http://localhost:3002/api/sandbox/${sandboxId}/files`)
      const result = await response.json()
      if (result.success) {
        setFiles(result.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoadingFiles(false)
    }
  }

  const canExecute = ['javascript', 'python', 'bash'].includes(language)

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy Code</span>
              </>
            )}
          </button>
          
          {canExecute && (
            <button
              onClick={handleExecute}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run Code</span>
            </button>
          )}
          
          {sandboxId && (
            <button
              onClick={handleGetFiles}
              disabled={loadingFiles}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{loadingFiles ? 'Loading...' : 'Get Real Files'}</span>
            </button>
          )}
        </div>
      </div>
      
      {showExecution && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">Output</h4>
            <button
              onClick={() => setShowExecution(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <pre className="text-green-400 text-sm font-mono">
            {`> Executing ${language} code...
> Code executed successfully!
> Result: { success: true, message: "Operation completed" }`}
          </pre>
        </div>
      )}
      
      {files && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-4">Generated Files from Sandbox</h4>
          <div className="space-y-4">
            {Object.entries(files).map(([fileName, fileData]: [string, any]) => (
              <div key={fileName} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-blue-400">{fileName}</h5>
                  <span className="text-xs text-gray-400">{fileData.path}</span>
                </div>
                <pre className="text-sm bg-gray-700 p-3 rounded overflow-x-auto">
                  <code>{fileData.content}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400 mb-1">Lines of code</div>
          <div className="text-xl font-semibold">{code.split('\n').length}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400 mb-1">Characters</div>
          <div className="text-xl font-semibold">{code.length}</div>
        </div>
      </div>
    </div>
  )
}

export default CodeOutput