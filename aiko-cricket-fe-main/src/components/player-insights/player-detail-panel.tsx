import type { FC, ReactNode } from "react";
import Image from "next/image";
import type { Player } from "./types";

interface PlayerDetailPanelProps {
  player: Player | null;
  isTipsLoading: boolean;
  tipsError: Error | null;
  renderPlayerTips: () => ReactNode;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const PlayerDetailPanel: FC<PlayerDetailPanelProps> = ({
  player,
  isTipsLoading,
  tipsError,
  renderPlayerTips,
}) => {
  if (!player) {
    return (
      <div className="flex-1 w-full lg:max-w-[50%]">
        <div className="bg-background rounded-lg sm:rounded-xl shadow-lg border p-4 sm:p-5 md:p-6 h-full flex items-center justify-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
          <p className="text-muted-foreground text-center text-sm sm:text-base">
            {isTipsLoading
              ? "Loading player tips..."
              : tipsError
                ? "Unable to load player tips right now."
                : "Select a player from the field to view details and tips"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full lg:max-w-[50%]">
      <div className="bg-background rounded-lg sm:rounded-xl shadow-lg border p-4 sm:p-5 md:p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-shrink-0">
            {player.player_image ? (
              <Image
                src={player.player_image}
                alt={player.full_name}
                width={80}
                height={80}
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-3 border-primary shadow-lg object-cover"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-3 border-primary shadow-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm sm:text-base md:text-lg">
                {getInitials(player.full_name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{player.full_name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{player.playing_role}</p>
          </div>
        </div>
        {renderPlayerTips()}
      </div>
    </div>
  );
};
