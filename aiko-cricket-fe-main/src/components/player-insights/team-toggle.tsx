import type { FC } from "react";

interface TeamToggleProps {
  teams: Array<{ name: string }>;
  selectedTeamIndex: number;
  onSelectTeam: (index: number) => void;
}

export const TeamToggle: FC<TeamToggleProps> = ({
  teams,
  selectedTeamIndex,
  onSelectTeam,
}) => {
  return (
    <div className="w-full px-3 sm:px-4 md:px-6 mb-4 md:mb-6 pb-4 md:pb-6">
      <div className="flex h-9 sm:h-10 md:h-12 items-center rounded-lg bg-muted p-1 sm:p-1.5 gap-0.5 sm:gap-1">
        {teams.map((team, index) => (
          <button
            key={team.name}
            onClick={() => onSelectTeam(index)}
            className={`flex h-full flex-1 items-center justify-center rounded-md px-1 sm:px-2 md:px-3 font-semibold text-xs sm:text-sm md:text-base transition-all duration-200 ${
              selectedTeamIndex === index
                ? "bg-primary text-white shadow-md sm:shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="truncate">{team.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
