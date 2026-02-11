/**
 * Tasks Page
 * Feature: 004-maintenance-core
 * 
 * Task management with swipe gestures
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { TaskCard } from '@/components/tasks/TaskCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';

export default function TasksPage() {
    const params = useParams();
    const kartId = params.kartId as string;
    const { team } = useTeam();
    const { tasks, loading, completeTask, deleteTask } = useTasks(team?.id || '', kartId);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading tasks...</div>
            </div>
        );
    }

    const highPriorityTasks = tasks.filter(t => t.priority === 'High');
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'Medium');

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 p-4 pb-24">
                <div className="max-w-4xl mx-auto">
                    <Link href={`/karts/${kartId}`} className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
                        ← Back to Kart
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-6">Maintenance Tasks</h1>

                    {/* High Priority */}
                    {highPriorityTasks.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-red-400 mb-4">
                                🚨 High Priority ({highPriorityTasks.length})
                            </h2>
                            <div className="space-y-3">
                                {highPriorityTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onComplete={() => completeTask(task.id)}
                                        onDelete={() => deleteTask(task.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Medium Priority */}
                    {mediumPriorityTasks.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-yellow-400 mb-4">
                                ⚠️ Medium Priority ({mediumPriorityTasks.length})
                            </h2>
                            <div className="space-y-3">
                                {mediumPriorityTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onComplete={() => completeTask(task.id)}
                                        onDelete={() => deleteTask(task.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {tasks.length === 0 && (
                        <div className="bg-gray-800 rounded-lg p-12 text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-white mb-2">All Clear!</h2>
                            <p className="text-gray-400">
                                No pending maintenance tasks. Keep logging hours to track your maintenance schedule.
                            </p>
                        </div>
                    )}

                    {/* Swipe Instructions */}
                    {tasks.length > 0 && (
                        <div className="mt-6 bg-blue-900 border border-blue-600 rounded-lg p-4">
                            <p className="text-blue-100 text-sm">
                                <strong>Swipe right</strong> to mark complete • <strong>Swipe left</strong> to delete
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
