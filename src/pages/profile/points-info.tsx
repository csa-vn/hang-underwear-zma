import React from "react";
import scoreRankingImage from "@/static/score_ranking.jpeg";
import scoreBoardImage from "@/static/score_board.jpeg";

export default function PointsInfo() {
  return (
    <div className="min-h-full bg-section p-4 space-y-6">
      {/* Hạng Thành Viên */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <h2 className="text-lg font-bold text-center">🏆 Hạng Thành Viên</h2>
        </div>
        <img
          src={scoreRankingImage}
          alt="Hạng Thành Viên"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Bảng Tích Điểm */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h2 className="text-lg font-bold text-center">📊 Bảng Tích Điểm</h2>
        </div>
        <img
          src={scoreBoardImage}
          alt="Bảng Tích Điểm"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
}
