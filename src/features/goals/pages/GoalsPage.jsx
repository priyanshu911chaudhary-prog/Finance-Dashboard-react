import { useState } from 'react';
import { Loader } from '../../../shared/components/ui/Loader';
import { Plus } from 'lucide-react';
import { useGoalStore } from '../../../store/useGoalStore';
import { GoalCard } from '../components/GoalCard';
import { Modal } from '../../../shared/components/ui/Modal';
import { GoalForm } from '../components/GoalForm';

export function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { goals, addGoal } = useGoalStore();

  const handleAddGoal = (data) => {
    addGoal(data);
    setIsModalOpen(false);
  };

  if (!goals) {
    return <Loader className="h-[60vh]" size={48} />;
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Savings Goals</h1>
          <p className="text-muted mt-1">Track progress towards your financial milestones.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1 sm:gap-2 bg-accent text-background px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-muted">No goals set yet. Start saving for your next milestone!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Savings Goal">
        <GoalForm onSubmit={handleAddGoal} />
      </Modal>
    </div>
  );
}