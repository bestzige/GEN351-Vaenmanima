export interface WheelItem {
  name: string;
  weight: number;
}
export interface SegmentItem {
  name: string;
  start: number;
  end: number;
  color: string;
  index: number;
}

export interface SpinHistoryItem {
  id: number;
  resultName: string;
  timestamp: string;
}

export const STORAGE_KEY = 'spinWheelConfig';
export const HISTORY_STORAGE_KEY = 'spinWheelHistory';

export const initialWheelConfig: WheelItem[] = [
  { name: 'เพิ่มไก่', weight: 5 },
  { name: 'เพิ่มน้ำพริก', weight: 5 },
  { name: 'เพิ่มผัก', weight: 5 },
  { name: 'Nothing', weight: 85 },
];

export const loadConfig = (): WheelItem[] => {
  if (typeof window === 'undefined') return initialWheelConfig;

  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, i: number) => ({
          name: typeof item?.name === 'string' ? item.name : `Item ${i + 1}`,
          weight: Math.max(0, Number(item?.weight) || 0),
        }));
      }
    } catch (error) {
      console.error('Error parsing config from localStorage:', error);
    }
  }
  return initialWheelConfig;
};

export const saveConfig = (config: WheelItem[]): void => {
  if (typeof window === 'undefined') return;

  try {
    const dataToSave = JSON.stringify(
      config.map((item) => ({
        name: item.name,
        weight: Math.max(0, Number(item.weight) || 0),
      }))
    );
    localStorage.setItem(STORAGE_KEY, dataToSave);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export interface SpinHistoryItem {
  id: number;
  resultName: string;
  timestamp: string;
}

export const loadHistory = (): SpinHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (savedHistory) {
    try {
      return JSON.parse(savedHistory);
    } catch (error) {
      console.error('Error parsing history from localStorage:', error);
    }
  }
  return [];
};

export const saveNewHistory = (resultName: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const currentHistory = loadHistory();
    const newId = currentHistory.length > 0 ? currentHistory[0].id + 1 : 1;

    const newItem: SpinHistoryItem = {
      id: newId,
      resultName,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [newItem, ...currentHistory].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving new history item:', error);
  }
};

export const COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
  '#9e9e9e',
  '#ad1457',
  '#6a1b9a',
  '#283593',
  '#0277bd',
  '#00695c',
  '#2e7d32',
  '#558b2f',
  '#9e9d24',
  '#fbc02d',
  '#f57f17',
  '#e65100',
  '#bf360c',
  '#4e342e',
  '#424242',
  '#37474f',
  '#1de9b6',
  '#00e676',
  '#76ff03',
  '#c6ff00',
  '#ffea00',
  '#ffd600',
  '#ff9100',
  '#ff3d00',
  '#d50000',
  '#aa00ff',
  '#6200ea',
  '#304ffe',
  '#0091ea',
  '#00b8d4',
  '#00bfa5',
  '#64dd17',
];
