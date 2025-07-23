import { templates } from '../utils/templates'

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void
  activeTemplate: string | null
}

const TemplateSelector = ({ onSelectTemplate, activeTemplate }: TemplateSelectorProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Templates</h2>
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
              activeTemplate === template.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{template.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm opacity-80 mt-1">{template.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TemplateSelector