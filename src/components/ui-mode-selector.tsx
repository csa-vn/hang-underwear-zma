import { useAtom } from "jotai";
import { setUIModeState, UIMode } from "@/state";
import Button from "./button";

interface UIModeModalProps {
  isOpen: boolean;
  onSelect: (mode: UIMode) => void;
}

export default function UIModeModal({ isOpen, onSelect }: UIModeModalProps) {
  const [, setUIMode] = useAtom(setUIModeState);

  const handleModeSelect = (mode: UIMode) => {
    setUIMode(mode);
    onSelect(mode);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md p-4 w-full max-w-xs text-center">
        <button
          onClick={() => handleModeSelect("simple")}
          className="w-full py-4 text-2xl font-bold text-black border-b border-gray-200"
        >
          Chế Độ Đơn Giản
        </button>

        <button
          onClick={() => handleModeSelect("normal")}
          className="w-full py-4 text-2xl font-bold text-black"
        >
          Chế Độ Bình Thường
        </button>
      </div>
    </div>
  );
}

interface UIModeChangeButtonProps {
  currentMode: UIMode;
  onModeChange: () => void;
}

export function UIModeChangeButton({
  currentMode,
  onModeChange,
}: UIModeChangeButtonProps) {
  return (
    <Button
      onClick={onModeChange}
      accessible={false}
      small
      className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-2 py-1 h-8 flex items-center justify-center"
    >
      {currentMode === "simple" ? "Đơn giản" : "Bình thường"}
    </Button>
  );
}
