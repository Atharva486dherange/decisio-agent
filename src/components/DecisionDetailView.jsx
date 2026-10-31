import React, { useState } from 'react';
import { ArrowLeft, Calendar, ArrowRight, ExternalLink, Video, CheckCircle, Circle, Repeat, Clock, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DecisionDetailView({ 
  onBack, 
  onReplaceEarlierDecision, 
  onKeepBoth, 
  onRevisitLater,
  isResolved: _isResolved = false
}) {
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      task: 'Update launch checklist',
      owner: 'Priya',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      dueDate: 'Nov 20',
      status: 'In Progress',
      completed: false
    },
    {
      id: 'task-2',
      task: 'Prepare release notes',
      owner: 'Dev',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      dueDate: 'Nov 21',
      status: 'To Do',
      completed: false
    },
    {
      id: 'task-3',
      task: 'Notify customers',
      owner: 'Alex',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      dueDate: 'Nov 22',
      status: 'To Do',
      completed: false
    }
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          status: !t.completed ? 'Done' : 'In Progress'
        };
      }
      return t;
    }));
  };

  const handleReplaceClick = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
    onReplaceEarlierDecision();
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      
      {/* Back Link */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-charcoal-100 hover:text-charcoal-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to decision journal</span>
      </button>

      {/* Main Grid: Content (Left) + What Changed Action Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Title & Subtitle */}
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-900 leading-none">
              Launch date
            </h1>
            <p className="text-sm sm:text-base text-charcoal-100 mt-2 font-normal">
              Final decision on product launch date for v2.0
            </p>
          </div>

          {/* Decision Comparison Cards */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Previous Commitment Card */}
            <div className="w-full sm:w-1/2 p-4 sm:p-5 rounded-2xl bg-cream-50 border border-cream-200/90 shadow-sm relative">
              <div className="flex items-center space-x-2 text-charcoal-50 text-xs font-medium mb-2">
                <Calendar className="w-4 h-4 text-charcoal-50" />
                <span>Previous commitment</span>
              </div>
              <div className="flex items-baseline space-x-2.5">
                <span className="font-sans text-2xl sm:text-3xl font-bold text-charcoal-900">
                  Nov 15
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-100">
                  Superseded
                </span>
              </div>
            </div>

            {/* Transition Arrow */}
            <ArrowRight className="w-5 h-5 text-charcoal-50 shrink-0 hidden sm:block" />

            {/* Current Decision Card */}
            <div className="w-full sm:w-1/2 p-4 sm:p-5 rounded-2xl bg-[#F0F8F2] border border-[#D5EAD9] shadow-sm relative">
              <div className="flex items-center space-x-2 text-forest-700 text-xs font-medium mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Current decision</span>
              </div>
              <div className="flex items-baseline space-x-2.5">
                <span className="font-sans text-2xl sm:text-3xl font-bold text-charcoal-900">
                  Nov 22
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#D2ECD7] text-forest-700">
                  Active
                </span>
              </div>
            </div>

          </div>

          {/* Source Quote Callout */}
          <div className="rounded-2xl bg-terracotta-50/70 border-l-4 border-terracotta-500 p-4 sm:p-5 flex items-start space-x-3.5 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" 
              alt="Sarah" 
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-terracotta-200 mt-0.5"
            />
            <div className="space-y-1">
              <blockquote className="font-serif italic text-base sm:text-lg text-charcoal-900 leading-snug">
                “Backend isn’t ready. Let’s move it one week.”
              </blockquote>
              <div className="text-xs text-charcoal-100 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-charcoal-900">Sarah</span>
                <span>•</span>
                <span>10:24 AM, Nov 14</span>
                <span>•</span>
                <span className="inline-flex items-center space-x-1 text-charcoal-900 underline underline-offset-2 decoration-charcoal-50 hover:text-terracotta-600 cursor-pointer">
                  <span>From Sprint 12 Sync</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Follow-up Tasks (3) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-charcoal-50" />
                <span>Follow-up tasks ({tasks.length})</span>
              </h3>
              <button className="text-xs font-semibold text-charcoal-900 hover:text-terracotta-600 transition-colors flex items-center space-x-1">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Table */}
            <div className="bg-cream-50 rounded-2xl border border-cream-200/90 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-200/80 text-charcoal-50 font-medium">
                    <th className="py-2.5 px-4 font-medium">Task</th>
                    <th className="py-2.5 px-4 font-medium">Owner</th>
                    <th className="py-2.5 px-4 font-medium">Due date</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200/60">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-cream-100/60 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-2.5 font-medium text-charcoal-900">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className="text-charcoal-50 hover:text-terracotta-500 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span className={task.completed ? 'line-through text-charcoal-50' : ''}>
                          {task.task}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={task.avatar} 
                            alt={task.owner} 
                            className="w-5 h-5 rounded-full object-cover border border-cream-300"
                          />
                          <span className="text-charcoal-900 font-medium">{task.owner}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-charcoal-100 font-mono">
                        {task.dueDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          task.status === 'In Progress'
                            ? 'bg-[#E8F0FE] text-[#2563EB]'
                            : task.status === 'Done'
                            ? 'bg-[#EAF5EC] text-[#15803D]'
                            : 'bg-cream-200 text-charcoal-100'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols) - "What changed?" Card */}
        <div className="lg:col-span-4 bg-cream-50 rounded-3xl border border-cream-200/90 p-5 sm:p-6 shadow-sm space-y-5">
          
          <h2 className="font-serif text-xl font-bold text-charcoal-900">
            What changed?
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Earlier Decision */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-charcoal-100">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Earlier decision</span>
              </div>
              <span className="font-semibold text-charcoal-900">Nov 15</span>
            </div>

            {/* Updated to */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-charcoal-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Updated to</span>
              </div>
              <span className="font-bold text-emerald-700">Nov 22</span>
            </div>

            <hr className="border-cream-200 my-2" />

            {/* Source Meeting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-charcoal-100">
                <Video className="w-4 h-4 text-charcoal-50" />
                <span>Source meeting</span>
              </div>
              <a 
                href="#meeting" 
                className="font-medium text-charcoal-900 underline underline-offset-2 decoration-charcoal-50 hover:text-terracotta-600 flex items-center"
              >
                Sprint 12 Sync <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            {/* Confidence Level */}
            <div className="flex items-center justify-between">
              <span className="text-charcoal-100">Confidence level</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5EC] text-[#15803D]">
                High
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Primary Action Button */}
            <button
              onClick={handleReplaceClick}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-terracotta-500 hover:bg-terracotta-600 text-white flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <Repeat className="w-4 h-4" />
              <span>Replace earlier decision</span>
            </button>

            {/* Keep Both */}
            <button
              onClick={onKeepBoth}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium bg-cream-50 hover:bg-cream-100 text-charcoal-900 border border-cream-200/90 flex items-center justify-center space-x-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-charcoal-50" />
              <span>Keep both</span>
            </button>

            {/* Revisit Later */}
            <button
              onClick={onRevisitLater}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium bg-cream-50 hover:bg-cream-100 text-charcoal-900 border border-cream-200/90 flex items-center justify-center space-x-2 transition-colors"
            >
              <Clock className="w-4 h-4 text-charcoal-50" />
              <span>Revisit later</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
