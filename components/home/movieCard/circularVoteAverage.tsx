import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import styles from "./circularVoteAverage.module.css";

interface CircularVoteAverageProps {
  vote_average: number;
}

const CircularVoteAverage: React.FC<CircularVoteAverageProps> = ({
  vote_average,
}) => {
  const getVoteColor = (vote: number) => {
    if (vote >= 7) {
      const green = "#65a30d";
      return green;
    } else if (vote >= 5) {
      const yellow = "#eab308";
      return yellow;
    } else {
      const red = "#dc2626";
      return red;
    }
  };

  return (
    <div className={styles.circularProgressbarContainer}>
      <CircularProgressbar
        value={vote_average * 10}
        text={`${vote_average}`}
        styles={buildStyles({
          textColor: getVoteColor(vote_average),
          pathColor: getVoteColor(vote_average),
          trailColor: "rgba(255, 255, 255, 0.2)",
          textSize: "36px",
        })}
      />
    </div>
  );
};

export default CircularVoteAverage;
