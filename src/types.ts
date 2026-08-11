
export interface StoreState {
  openCashiers: number;
  queues: number[];
  timeStep: number;
}

export interface ActionInfo {
  name: string;
  color: string;
  description: string;
}

export type Action = 0 | 1 | 2 | 3;

export const ACTIONS: Record<Action, ActionInfo> = {
  0: { name: 'Open Cashier', color: '#ec4899', description: '+8 reward if needed' },
  1: { name: 'Close Cashier', color: '#a855f7', description: '+5 reward if empty' },
  2: { name: 'Redirect', color: '#3b82f6', description: '+2 reward for balance' },
  3: { name: 'Wait', color: '#64748b', description: '-1 overhead' },
};
