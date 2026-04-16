import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Wallet } from 'lucide-react';
import { StatCard } from '../StatCard';

describe('StatCard Component', () => {
  it('renders the title and formatted amount correctly', () => {
    render(
      <StatCard 
        title="Total Balance" 
        amount={125050} 
        icon={Wallet} 
      />
    );

    // Assert title is rendered
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    
    // Assert amount is formatted with commas and 2 decimal places
    expect(screen.getByText('₹1,25,050.00')).toBeInTheDocument();
  });

  it('renders positive trend styling when trend is greater than 0', () => {
    render(
      <StatCard 
        title="Income" 
        amount={500000} 
        icon={Wallet} 
        trend={5.2} 
        trendLabel="vs last month"
      />
    );

    const trendElement = screen.getByText('+5.2%');
    expect(trendElement).toBeInTheDocument();
    // Assuming our positive trend text uses the 'text-accent' Tailwind class
    expect(trendElement).toHaveClass('text-accent');
  });

  it('renders negative trend styling when trend is less than 0', () => {
    render(
      <StatCard 
        title="Expenses" 
        amount={10000} 
        icon={Wallet} 
        trend={-2.1} 
        trendLabel="vs last month"
      />
    );

    const trendElement = screen.getByText('-2.1%');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-destructive');
  });
});