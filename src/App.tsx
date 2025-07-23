import { useState } from 'react'
import CodePlayground from './components/CodePlayground'
import Header from './components/Header'
import TemplateSelector from './components/TemplateSelector'

function App() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TemplateSelector 
              onSelectTemplate={setActiveTemplate}
              activeTemplate={activeTemplate}
            />
          </div>
          <div className="lg:col-span-3">
            <CodePlayground 
              activeTemplate={activeTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App