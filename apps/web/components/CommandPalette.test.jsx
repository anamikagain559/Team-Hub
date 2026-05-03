import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from './CommandPalette';
import { useRouter } from 'next/navigation';
import useWorkspaceStore from '@/store/useWorkspaceStore';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the store
jest.mock('@/store/useWorkspaceStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('CommandPalette', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useWorkspaceStore as jest.Mock).mockReturnValue({
      currentWorkspace: { name: 'Test Workspace' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not be visible by default', () => {
    render(<CommandPalette />);
    expect(screen.queryByPlaceholderText('Type to navigate...')).not.toBeInTheDocument();
  });

  it('should open when Ctrl+K is pressed', () => {
    render(<CommandPalette />);
    
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    expect(screen.getByPlaceholderText('Type to navigate...')).toBeInTheDocument();
  });

  it('should filter items based on search query', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    const input = screen.getByPlaceholderText('Type to navigate...');
    fireEvent.change(input, { target: { value: 'Goals' } });
    
    expect(screen.getByText('Strategic Goals')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should navigate to selected item on Enter', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    fireEvent.keyDown(window, { key: 'Enter' });
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
