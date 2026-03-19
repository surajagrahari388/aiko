export const prettifyCategoryName = (name: string): string => {
  return name
    .replace(/[_\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const teamNamePatterns = [
  /team[_\s-]*a/gi,
  /team[_\s-]*b/gi,
  /teama/gi,
  /teamb/gi,
  /टीम[_\s-]*ए/gi,
  /टीम[_\s-]*बी/gi,
  /टीमए/gi,
  /टीमबी/gi,
  /टीम[_\s-]*A/gi,
  /टीम[_\s-]*B/gi,
  /టీమ్_ఎ/gi,
  /அணிA/gi,
  /టీమ్_బి/gi,
  /அணிB/gi,
  /அணி_ஏ/gi,
  /టీమ్A/gi,
  /அணி_பி/gi,
  /టీమ్B/gi,
];

export const replaceTeamPlaceholders = (
  text: string,
  teamA: string,
  teamB: string
): string => {
  return text
    .replace(teamNamePatterns[0], teamA)
    .replace(teamNamePatterns[1], teamB)
    .replace(teamNamePatterns[2], teamA)
    .replace(teamNamePatterns[3], teamB)
    .replace(teamNamePatterns[4], teamA)
    .replace(teamNamePatterns[5], teamB)
    .replace(teamNamePatterns[6], teamA)
    .replace(teamNamePatterns[7], teamB)
    .replace(teamNamePatterns[8], teamA)
    .replace(teamNamePatterns[9], teamB)
    .replace(teamNamePatterns[10], teamA)
    .replace(teamNamePatterns[11], teamB)
    .replace(teamNamePatterns[12], teamA)
    .replace(teamNamePatterns[13], teamB)
    .replace(teamNamePatterns[14], teamA)
    .replace(teamNamePatterns[15], teamB);
};

export const getCategoryDisplayName = (
  categoryName: string,
  teamA: string,
  teamB: string
): string => {
  const updatedCategoryName = replaceTeamPlaceholders(
    categoryName,
    teamA,
    teamB
  );
  return prettifyCategoryName(updatedCategoryName);
};
