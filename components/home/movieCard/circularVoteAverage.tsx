import React, { useId } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import styles from "./circularVoteAverage.module.css";

interface CircularVoteAverageProps {
  vote_average: number;
  compact?: boolean;
}

const CircularVoteAverage: React.FC<CircularVoteAverageProps> = ({
  vote_average,
  compact = false,
}) => {
  const instanceId = useId();
  const greenId = `green-${instanceId}`;
  const yellowId = `yellow-${instanceId}`;
  const redId = `red-${instanceId}`;

  const getGradientId = (vote: number) => {
    if (vote >= 7) {
      return greenId;
    } else if (vote >= 5) {
      return yellowId;
    } else {
      return redId;
    }
  };

  const getVoteColor = (vote: number) => {
    if (vote >= 7) {
      return "#65a30d";
    } else if (vote >= 5) {
      return "#eab308";
    } else {
      return "#dc2626";
    }
  };

  return (
    <div
      className={
        compact
          ? styles.circularProgressbarContainerCompact
          : styles.circularProgressbarContainer
      }
    >
      <svg style={{ height: 2 }}>
        <defs>
          <linearGradient id={greenId} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#3f6212" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
          <linearGradient id={yellowId} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id={redId} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgressbar
        value={vote_average * 10}
        text={`${(vote_average * 10).toFixed(0)}%`}
        styles={buildStyles({
          textColor: getVoteColor(vote_average),
          pathColor: `url(#${getGradientId(vote_average)})`,
          trailColor: "rgba(255, 255, 255, 0.2)",
          textSize: "30px",
        })}
      />
    </div>
  );
};

export default CircularVoteAverage;
