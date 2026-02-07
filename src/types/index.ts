import { Timestamp } from 'firebase/firestore';

export interface User {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    defaultTeamId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type Role = 'owner' | 'editor' | 'viewer';

export interface Team {
    id: string;
    name: string;
    ownerId: string;
    members: Record<string, Role>;
    inviteCode?: string;
    createdAt: Timestamp;
}

export type PartType = 'engine' | 'chassis' | 'tire';
export type PartStatus = 'active' | 'maintenance' | 'retired';

export interface BasePart {
    id: string;
    type: PartType;
    name: string;
    serialNumber: string;
    status: PartStatus;
    notes?: string;
    acquisitionDate: Timestamp;
}

export interface EnginePart extends BasePart {
    type: 'engine';
    hours: number;
    lastRebuild?: Timestamp;
}

export interface ChassisPart extends BasePart {
    type: 'chassis';
    modelYear: number;
    setupNotes?: string;
}

export interface TirePart extends BasePart {
    type: 'tire';
    compound: string;
    condition: 'new' | 'scrubbed' | 'worn';
    installDate?: Timestamp;
}

export type Part = EnginePart | ChassisPart | TirePart;

export interface SessionSetup {
    engineId?: string;
    chassisId?: string;
    tireSetId?: string;
    tirePressure?: {
        fl: number;
        fr: number;
        rl: number;
        rr: number;
    };
    gearing?: string;
}

export interface Session {
    id: string;
    date: Timestamp;
    trackName: string;
    weather?: {
        temp: number;
        conditions: string;
    };
    driverId: string;
    notes?: string;
    setup?: SessionSetup;
}
