export interface Template {
  id: string
  name: string
  description: string
  prompt: string
  language: string
  icon: string
}

export const templates: Template[] = [
  {
    id: 'api-endpoint',
    name: 'REST API Endpoint',
    description: 'Generate a complete REST API endpoint',
    prompt: 'Create a REST API endpoint for managing ',
    language: 'javascript',
    icon: '🔌'
  },
  {
    id: 'react-component',
    name: 'React Component',
    description: 'Create a React component with props and state',
    prompt: 'Create a React component that ',
    language: 'typescript',
    icon: '⚛️'
  },
  {
    id: 'database-schema',
    name: 'Database Schema',
    description: 'Generate SQL database schema',
    prompt: 'Create a database schema for ',
    language: 'sql',
    icon: '🗄️'
  },
  {
    id: 'algorithm',
    name: 'Algorithm Implementation',
    description: 'Implement common algorithms',
    prompt: 'Implement the algorithm for ',
    language: 'python',
    icon: '🧮'
  },
  {
    id: 'unit-test',
    name: 'Unit Tests',
    description: 'Generate unit tests for your code',
    prompt: 'Write comprehensive unit tests for ',
    language: 'javascript',
    icon: '🧪'
  },
  {
    id: 'data-transform',
    name: 'Data Transformation',
    description: 'Transform and process data',
    prompt: 'Write a function to transform ',
    language: 'python',
    icon: '🔄'
  },
  {
    id: 'regex-pattern',
    name: 'Regex Pattern',
    description: 'Create regex patterns with explanations',
    prompt: 'Create a regex pattern to match ',
    language: 'javascript',
    icon: '🔍'
  },
  {
    id: 'cli-tool',
    name: 'CLI Tool',
    description: 'Build command-line tools',
    prompt: 'Create a CLI tool that ',
    language: 'bash',
    icon: '💻'
  }
]