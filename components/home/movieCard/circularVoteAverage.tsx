import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import styles from "./circularVoteAverage.module.css";

interface CircularVoteAverageProps {
  vote_average: number;
}

const CircularVoteAverage: React.FC<CircularVoteAverageProps> = ({
  vote_average,
}) => {
  const getGradientId = (vote: number) => {
    if (vote >= 7) {
      return "greenGradient";
    } else if (vote >= 5) {
      return "yellowGradient";
    } else {
      return "redGradient";
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
    <div className={styles.circularProgressbarContainer}>
      <svg style={{ height: 2 }}>
        <defs>
          <linearGradient id="greenGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#3f6212" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
          <linearGradient id="yellowGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id="redGradient" gradientTransform="rotate(90)">
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
