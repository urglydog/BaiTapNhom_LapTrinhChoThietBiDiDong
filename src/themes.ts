export interface Theme {
  background: string;
  card: string;
  text: string;
  subtext: string;
  primary: string;
  accent: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export const lightTheme: Theme = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  subtext: '#666666',
  primary: '#007AFF',
  accent: '#E91E63',
  border: '#e0e0e0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
};

export const darkTheme: Theme = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  subtext: '#b0b0b0',
  primary: '#0A84FF',
  accent: '#FF2D55',
  border: '#333333',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',
};

