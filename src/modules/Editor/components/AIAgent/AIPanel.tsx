import React, { useState } from 'react'
import { AIService } from '../../services/aiService'

interface AIPanelProps {
  aiService: AIService
}

const AIPanel: React.FC<AIPanelProps> = ({ aiService }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [response, setResponse] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      const result = await aiService.generateCompletion(prompt)
      setResponse(result)
    } catch (error) {
      console.error('AI generation failed:', error)
      setResponse('AI generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          🤖 AI Assistant
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {aiService.isEnabled() ? 'Ready' : 'Disabled'}
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        {/* Chat input */}
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me anything about LaTeX..."
            className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none text-sm"
            disabled={!aiService.isEnabled()}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || !aiService.isEnabled()}
            className="w-full btn-primary text-sm"
          >
            {isGenerating ? '🔄 Generating...' : '✨ Generate'}
          </button>
        </div>

        {/* Response */}
        {response && (
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-y-auto">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}

        {/* Features placeholder */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>📝 Inline completions (Coming soon)</div>
          <div>🔧 Function calling (Coming soon)</div>
          <div>💬 Chat history (Coming soon)</div>
        </div>
      </div>
    </div>
  )
}

export default AIPanel 