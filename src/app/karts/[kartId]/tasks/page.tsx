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
import { TaskCard } from '@/components/tasks/TaskCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';

import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';

export default function TasksPage() {
    const params = useParams();
    const kartId = params.kartId as string;
    const { tasks, loading, completeTask, deleteTask } = useTasks(kartId);

    if (loading) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="flex items-center justify-center h-full min-h-[50vh]">
                        <div className="text-app-text">Loading tasks...</div>
                    </div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    const highPriorityTasks = tasks.filter(t => t.priority === 'High');
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'Medium');

    return (
        <PrivateRoute>
            <MainLayout>
                <ErrorBoundary>
                    <div className="p-4">
                        <div className="max-w-4xl mx-auto">
                            <Link href={`/karts/${kartId}`} className="text-primary hover:text-blue-600 mb-4 inline-block font-medium">
                                ← Back to Kart
                            </Link>

                            <h1 className="text-3xl font-bold text-app-text mb-6">Maintenance Tasks</h1>

                            {/* High Priority */}
                            {highPriorityTasks.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-status-due mb-4 flex items-center gap-2">
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
                                    <h2 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
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
                                <div className="bg-white border border-app-border rounded-lg p-12 text-center shadow-sm">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h2 className="text-2xl font-bold text-app-text mb-2">All Clear!</h2>
                                    <p className="text-text-subtle">
                                        No pending maintenance tasks. Keep logging hours to track your maintenance schedule.
                                    </p>
                                </div>
                            )}

                            {/* Swipe Instructions */}
                            {tasks.length > 0 && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Swipe right</strong> to mark complete • <strong>Swipe left</strong> to delete
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </ErrorBoundary>
            </MainLayout>
        </PrivateRoute>
    );
}
