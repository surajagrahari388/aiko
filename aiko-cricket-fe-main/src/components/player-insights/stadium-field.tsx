import { memo, useMemo } from "react";
import Image from "next/image";
import StadiumSvg from "@/components/ui/svg/StadiumSvg";
import type { Player, TeamFormation } from "./types";

interface StadiumFieldProps {
  formation: TeamFormation;
  selectedPlayer: Player | null;
  onSelectPlayer: (player: Player) => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const StadiumFieldComponent = ({
  formation,
  selectedPlayer,
  onSelectPlayer,
}: StadiumFieldProps) => {
  const players = useMemo(() => formation.players, [formation.players]);

  return (
    <div className="flex-1 w-full lg:max-w-[50%]">
      <div className="relative w-full mx-auto" style={{ aspectRatio: "1" }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-green-800 overflow-hidden shadow-lg sm:shadow-xl border-4 sm:border-6 lg:border-8 border-gray-800">
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />
          <StadiumSvg className="w-full h-full" />
          <div
            className="absolute inset-0 rounded-full shadow-inner"
            style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.3)" }}
          />
        </div>

        <div className="absolute inset-0">
          {players.map((item) => (
            <div
              key={item.player.player_id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 sm:gap-1 cursor-pointer group z-10 transition-all duration-300 ${
                selectedPlayer?.player_id === item.player.player_id
                  ? "scale-100 sm:scale-110"
                  : ""
              }`}
              style={{
                top: item.position.top,
                left: item.position.left,
              }}
              onClick={() => onSelectPlayer(item.player)}
            >
              <div className="relative">
                {item.player.player_image ? (
                  <Image
                    src={item.player.player_image}
                    alt={item.player.full_name}
                    width={44}
                    height={44}
                    className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full border-2 sm:border-2.5 md:border-3 border-white shadow-md sm:shadow-lg md:shadow-xl object-cover transition-all duration-300 group-hover:scale-110 md:group-hover:scale-125 group-hover:border-yellow-300 group-hover:shadow-yellow-300/70 group-hover:shadow-lg sm:group-hover:shadow-lg md:group-hover:shadow-2xl ${
                      selectedPlayer?.player_id === item.player.player_id
                        ? "shadow-yellow-300/70 shadow-lg md:shadow-xl"
                        : ""
                    }`}
                  />
                ) : (
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full border-2 sm:border-2.5 md:border-3 border-white shadow-md sm:shadow-lg md:shadow-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-[10px] sm:text-xs md:text-sm transition-all duration-300 group-hover:scale-110 md:group-hover:scale-125 group-hover:border-yellow-300 group-hover:shadow-yellow-300/70 group-hover:shadow-lg sm:group-hover:shadow-lg md:group-hover:shadow-2xl ${
                    selectedPlayer?.player_id === item.player.player_id
                      ? "shadow-yellow-300/70 shadow-lg md:shadow-xl"
                      : ""
                  }`}>
                    {getInitials(item.player.full_name)}
                  </div>
                )}
              </div>

              <span className={`text-white text-[7px] sm:text-[10px] md:text-[11px] font-bold bg-black/80 px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 rounded-full whitespace-nowrap text-center leading-tight shadow-md sm:shadow-lg border border-white/20 ${
                selectedPlayer?.player_id === item.player.player_id
                  ? "text-yellow-300 bg-black/90"
                  : ""
              }`}>
                {item.player.full_name.split(" ")[0]}
              </span>

              <span className="text-white text-[6px] sm:text-[8px] md:text-[9px] font-semibold bg-primary/70 px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md hidden sm:inline-block">
                {item.position.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StadiumField = memo(StadiumFieldComponent);
