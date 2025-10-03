import { TabConfig } from '../services/tab-persistence.service';

export const TAB_CONFIGS = {
  EMPLOYEE_FORM: {
    maxTabs: 7,
    defaultTab: 0,
    paramName: 'tab',
    encryptParams: true
  } as TabConfig,


  createConfig(maxTabs: number, defaultTab: number = 0, encrypt: boolean = true): TabConfig {
    return {
      maxTabs,
      defaultTab,
      paramName: 'tab',
      encryptParams: encrypt
    };
  }
};

export const TAB_NAMES = {
  EMPLOYEE: [
    'general',
    'contact',
    'organizational',
    'documents',
    'reportManagers',
    'assignSchedule',
    'policies'
  ]
};
