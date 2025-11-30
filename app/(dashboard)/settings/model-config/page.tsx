'use client'

import { useState } from 'react'
import { Settings, Music, Sliders, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function ModelConfigPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState({
    apiUrl: process.env.NEXT_PUBLIC_TEXT_TO_MUSIC_API_URL || '',
    apiKey: '',
    defaultDuration: 60,
    sampleRate: 44100,
    outputFormat: 'wav',
    quality: 'high',
    parameters: {
      temperature: 1.0,
      topK: 250,
      topP: 0.0,
    }
  })
  const [isTestGenerating, setIsTestGenerating] = useState(false)

  const handleSave = () => {
    localStorage.setItem('musicModelConfig', JSON.stringify(config))
    toast({
      title: 'Configuration Saved',
      description: 'Your model settings have been updated.',
      variant: 'success',
    })
  }

  const testGeneration = async () => {
    setIsTestGenerating(true)
    try {
      const response = await fetch('/api/music/generate-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'calm peaceful ambient music for meditation',
          duration: 10, // Short test
          mood: 'calm',
          style: 'ambient',
        }),
      })

      if (!response.ok) throw new Error('Test failed')

      toast({
        title: 'Test Successful!',
        description: 'Your model is working correctly.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Check your API URL and key.',
        variant: 'error',
      })
    } finally {
      setIsTestGenerating(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-calm-500" />
            Music Model Configuration
          </h1>
          <p className="text-gray-600">
            Configure your custom text-to-music AI model settings.
          </p>
        </div>

        <div className="space-y-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music size={20} />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  API Endpoint URL
                </label>
                <Input
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  placeholder="http://localhost:8000/generate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The URL where your text-to-music model is hosted
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  API Key (Optional)
                </label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Enter API key if required"
                />
              </div>

              <Button
                onClick={testGeneration}
                disabled={isTestGenerating}
                variant="outline"
                className="w-full"
              >
                {isTestGenerating ? 'Testing...' : 'Test Connection'}
              </Button>
            </CardContent>
          </Card>

          {/* Generation Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders size={20} />
                Generation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Default Duration (seconds)
                </label>
                <Input
                  type="number"
                  value={config.defaultDuration}
                  onChange={(e) => setConfig({ ...config, defaultDuration: parseInt(e.target.value) })}
                  min="10"
                  max="300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sample Rate (Hz)
                </label>
                <select
                  value={config.sampleRate}
                  onChange={(e) => setConfig({ ...config, sampleRate: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-calm-400 focus:outline-none"
                >
                  <option value="16000">16000 Hz (Low)</option>
                  <option value="22050">22050 Hz (Medium)</option>
                  <option value="44100">44100 Hz (High)</option>
                  <option value="48000">48000 Hz (Studio)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Output Format
                </label>
                <select
                  value={config.outputFormat}
                  onChange={(e) => setConfig({ ...config, outputFormat: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-calm-400 focus:outline-none"
                >
                  <option value="wav">WAV (Uncompressed)</option>
                  <option value="mp3">MP3 (Compressed)</option>
                  <option value="flac">FLAC (Lossless)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quality
                </label>
                <select
                  value={config.quality}
                  onChange={(e) => setConfig({ ...config, quality: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-calm-400 focus:outline-none"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best Quality)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Model Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Model Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Temperature
                  </label>
                  <span className="text-sm text-gray-600">{config.parameters.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={config.parameters.temperature}
                  onChange={(e) => setConfig({
                    ...config,
                    parameters: { ...config.parameters, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-calm-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controls randomness in generation (higher = more creative)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Top K
                  </label>
                  <span className="text-sm text-gray-600">{config.parameters.topK}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="50"
                  value={config.parameters.topK}
                  onChange={(e) => setConfig({
                    ...config,
                    parameters: { ...config.parameters, topK: parseInt(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-calm-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of top tokens to sample from
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Top P
                  </label>
                  <span className="text-sm text-gray-600">{config.parameters.topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.parameters.topP}
                  onChange={(e) => setConfig({
                    ...config,
                    parameters: { ...config.parameters, topP: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-calm-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nucleus sampling threshold (0 = disabled)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              <Save size={18} className="mr-2" />
              Save Configuration
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfig({
                  apiUrl: '',
                  apiKey: '',
                  defaultDuration: 60,
                  sampleRate: 44100,
                  outputFormat: 'wav',
                  quality: 'high',
                  parameters: {
                    temperature: 1.0,
                    topK: 250,
                    topP: 0.0,
                  }
                })
              }}
            >
              Reset to Defaults
            </Button>
          </div>

          {/* Documentation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">📘 Setup Instructions</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Ensure your text-to-music model is running and accessible</li>
                <li>Enter the API endpoint URL where your model is hosted</li>
                <li>Add an API key if your model requires authentication</li>
                <li>Adjust generation parameters based on your model's requirements</li>
                <li>Click "Test Connection" to verify everything is working</li>
                <li>Save your configuration</li>
              </ol>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs font-mono text-gray-700">
                  <strong>Expected API Format:</strong><br/>
                  POST {config.apiUrl || '/generate'}<br/>
                  Body: {`{ "prompt": "...", "duration": 60, "mood": "calm", "style": "ambient" }`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
