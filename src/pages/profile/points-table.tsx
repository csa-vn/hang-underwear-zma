import React from "react";
import scoreBoardImage from "@/static/score_board.jpeg";

export default function PointsTable() {
  return (
    <div className="min-h-full bg-section">
      <img
        src={scoreBoardImage}
        alt="Bảng Tích Điểm"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
