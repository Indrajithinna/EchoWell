'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, CheckCircle, Circle, Calendar, TrendingUp, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  targetDate: string
  isCompleted: boolean
  createdAt: string
  completedAt?: string
}

const goalCategories = [
  { value: 'mental-health', label: 'Mental Health', color: 'bg-blue-100 text-blue-700' },
  { value: 'productivity', label: 'Productivity', color: 'bg-green-100 text-green-700' },
  { value: 'relationships', label: 'Relationships', color: 'bg-purple-100 text-purple-700' },
  { value: 'self-care', label: 'Self Care', color: 'bg-pink-100 text-pink-700' },
  { value: 'learning', label: 'Learning', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'fitness', label: 'Fitness', color: 'bg-orange-100 text-orange-700' },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'mental-health',
    targetDate: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = () => {
    try {
      const savedGoals = localStorage.getItem('mindful-goals')
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals))
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const saveGoals = (updatedGoals: Goal[]) => {
    try {
      localStorage.setItem('mindful-goals', JSON.stringify(updatedGoals))
      setGoals(updatedGoals)
    } catch (error) {
      console.error('Error saving goals:', error)
    }
  }

  const addGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetDate: newGoal.targetDate,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }

    const updatedGoals = [...goals, goal]
    saveGoals(updatedGoals)
    
    setNewGoal({ title: '', description: '', category: 'mental-health', targetDate: '' })
    setShowAddForm(false)
  }

  const toggleGoal = (id: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        return {
          ...goal,
          isCompleted: !goal.isCompleted,
          completedAt: !goal.isCompleted ? new Date().toISOString() : undefined
        }
      }
      return goal
    })
    saveGoals(updatedGoals)
  }

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id)
    saveGoals(updatedGoals)
  }

  const getCategoryInfo = (category: string) => {
    return goalCategories.find(cat => cat.value === category) || goalCategories[0]
  }

  const completedGoals = goals.filter(goal => goal.isCompleted).length
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

  const upcomingGoals = goals
    .filter(goal => !goal.isCompleted && goal.targetDate)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3)

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Goals & Objectives</h1>
              <p className="text-gray-600">Set and track your personal development goals</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-calm-500 hover:bg-calm-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Total Goals</p>
                    <p className="text-2xl font-bold text-blue-900">{totalGoals}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{completedGoals}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Completion Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{completionRate.toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <Card className="mb-6 border-calm-200 bg-calm-50">
            <CardHeader>
              <CardTitle className="text-calm-800">Add New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <Input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="What do you want to achieve?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Add more details about your goal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-500"
                  >
                    {goalCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addGoal} className="bg-calm-500 hover:bg-calm-600">
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Goals */}
        {upcomingGoals.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Upcoming Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingGoals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className="text-gray-400 hover:text-calm-500"
                      >
                        <Circle size={20} />
                      </button>
                      <div>
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryInfo(goal.category).color}`}>
                      {getCategoryInfo(goal.category).label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Goals */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your journey by setting your first personal development goal.
                </p>
                <Button onClick={() => setShowAddForm(true)} className="bg-calm-500 hover:bg-calm-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            goals.map(goal => (
              <Card key={goal.id} className={`${goal.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`mt-1 ${goal.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-calm-500'}`}
                      >
                        {goal.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${goal.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {goal.title}
                        </h3>
                        
                        {goal.description && (
                          <p className={`text-gray-600 mb-3 ${goal.isCompleted ? 'line-through' : ''}`}>
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryInfo(goal.category).color}`}>
                            {getCategoryInfo(goal.category).label}
                          </span>
                          
                          {goal.targetDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Due: {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                          )}
                          
                          {goal.isCompleted && goal.completedAt && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Award size={14} />
                              Completed: {new Date(goal.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
