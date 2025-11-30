// Goals list component
interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline?: Date;
}

interface GoalsListProps {
  goals: Goal[];
  onGoalToggle: (goalId: string) => void;
}

export default function GoalsList({ goals, onGoalToggle }: GoalsListProps) {
  return (
    <div className="goals-list">
      {goals.map((goal) => (
        <div key={goal.id} className="goal-item">
          <input
            type="checkbox"
            checked={goal.completed}
            onChange={() => onGoalToggle(goal.id)}
          />
          <div>
            <h4>{goal.title}</h4>
            <p>{goal.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
