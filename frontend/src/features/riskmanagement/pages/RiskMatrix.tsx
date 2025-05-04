interface RiskMatrixProps {
  likelihoodBefore: number;
  severityBefore: number;
  likelihoodAfter: number;
  severityAfter: number;
}

const RiskMatrix = ({ likelihoodBefore, severityBefore, likelihoodAfter, severityAfter }: RiskMatrixProps) => {
  // Farbverlauf: Grün (niedrig) → Gelb (mittel) → Rot (hoch)
  const getColor = (likelihood: number, severity: number): string => {
    const riskLevel = likelihood * severity;
    if (riskLevel <= 4) return '#4CAF50'; // Grün
    if (riskLevel <= 9) return '#FFFF00'; // Gelb
    if (riskLevel <= 16) return '#FF9800'; // Orange
    return '#F44336'; // Rot
  };

  const matrixSize = 5;
  const cells: JSX.Element[] = [];

  // Matrix von unten nach oben (Likelihood: 1 unten, 5 oben)
  // und von links nach rechts (Severity: 1 links, 5 rechts)
  for (let y = matrixSize; y >= 1; y--) {
    const row: JSX.Element[] = [];
    for (let x = 1; x <= matrixSize; x++) {
      const isBefore = likelihoodBefore === y && severityBefore === x;
      const isAfter = likelihoodAfter === y && severityAfter === x;
      const label = isBefore ? 'B' : (isAfter ? 'A' : '');
      const color = isBefore || isAfter ? getColor(y, x) : '#FFFFFF';

      row.push(
        <div
          key={`${x}-${y}`}
          className="w-10 h-10 border border-gray-300 dark:border-gray-600 flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className={isBefore || isAfter ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>{label}</span>
        </div>
      );
    }
    cells.push(
      <div key={y} className="flex items-center">
        <span className="w-8 text-right mr-2 text-gray-700 dark:text-gray-300">{y}</span>
        {row}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center">
      <div className="mr-2 flex items-center">
        <span
          className="text-sm text-gray-700 dark:text-gray-300"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '100px' }}
        >
          Likelihood
        </span>
      </div>
      <div className="flex flex-col items-center">
        <div>{cells}</div>
        <div className="flex mt-1 ml-10">
          <span className="w-8" />
          {[1, 2, 3, 4, 5].map((severity) => (
            <span key={severity} className="w-10 text-center text-gray-700 dark:text-gray-300">{severity}</span>
          ))}
        </div>
        <div className="ml-10">
          <span className="text-sm text-gray-700 dark:text-gray-300">Severity</span>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;