/**
 * MaintenanceHistoryTable Component
 * Feature: 001-dashboard-refactor
 * 
 * Table displaying maintenance task history for a kart
 */

'use client';

import React from 'react';

interface MaintenanceTask {
    id: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'pending' | 'completed';
    createdAt: { seconds: number };
    completedAt?: { seconds: number };
}

interface MaintenanceHistoryTableProps {
    tasks: MaintenanceTask[];
    onTaskClick?: (taskId: string) => void;
    className?: string;
}

/**
 * MaintenanceHistoryTable - Display maintenance task history
 * 
 * Features:
 * - Sortable by date
 * - Priority badges
 * - Status indicators
 * - Click to view details
 * 
 * @param tasks - Array of maintenance tasks
 * @param onTaskClick - Optional callback when task is clicked
 * @param className - Additional CSS classes
 */
export function MaintenanceHistoryTable({ tasks, onTaskClick, className = '' }: MaintenanceHistoryTableProps) {
    if (tasks.length === 0) {
        return (
            <div className={`bg-white border border-app-border rounded-lg p-8 text-center ${className} shadow-sm`}>
                <p className="text-text-subtle">No maintenance history yet</p>
            </div>
        );
    }

    const priorityColors = {
        High: 'bg-red-100 text-red-800 border border-red-200',
        Medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        Low: 'bg-blue-100 text-blue-800 border border-blue-200',
    };

    const formatDate = (timestamp: { seconds: number }) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={`bg-white border border-app-border rounded-lg overflow-hidden ${className} shadow-sm`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-app-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-subtle">
                                Task
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-subtle">
                                Priority
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-subtle">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-subtle">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {tasks.map((task) => {
                            const isCompleted = task.status === 'completed';
                            const displayDate = isCompleted && task.completedAt
                                ? formatDate(task.completedAt)
                                : formatDate(task.createdAt);

                            return (
                                <tr
                                    key={task.id}
                                    onClick={() => onTaskClick?.(task.id)}
                                    className={`hover:bg-gray-50 transition-colors ${onTaskClick ? 'cursor-pointer' : ''}`}
                                >
                                    <td className="px-4 py-3 text-app-text font-medium">
                                        {task.description}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityColors[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {isCompleted ? (
                                            <span className="text-status-good font-medium flex items-center gap-1">
                                                <span>✓</span> Completed
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 font-medium flex items-center gap-1">
                                                <span>○</span> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-text-subtle text-sm">
                                        {displayDate}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
