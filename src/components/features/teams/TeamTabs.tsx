'use client';

// Tab navigation component for Team Dashboard
// Replaces the hardcoded tabs in page.tsx

export type TeamTab = 'chat' | 'lists' | 'members';

interface TeamTabsProps {
    activeTab: TeamTab;
    onTabChange: (tab: TeamTab) => void;
}

export function TeamTabs({ activeTab, onTabChange }: TeamTabsProps) {
    const tabs: { id: TeamTab; label: string }[] = [
        { id: 'chat', label: 'Chat' },
        { id: 'lists', label: 'Lists' },
        { id: 'members', label: 'Members' },
    ];

    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8" aria-label="Team Navigation">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`pb-4 px-1 border-b-2 transition ${activeTab === tab.id
                                ? 'border-primary-600 text-primary-600 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
