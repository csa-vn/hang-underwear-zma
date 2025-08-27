import React from "react";
import scoreRankingImage from "@/static/score_ranking.jpeg";

export default function MemberRanks() {
  return (
    <div className="min-h-full bg-section">
      <img
        src={scoreRankingImage}
        alt="Hạng Thành Viên"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
