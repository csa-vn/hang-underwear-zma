import { useAtom, useAtomValue } from "jotai";
import {
  UIMatch,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router-dom";
import { categoriesStateUpwrapped, uiModeState, setUIModeState } from "@/state";
import headerLogoImage from "@/static/logo.jpg";
import { BackIcon } from "./vectors";
import { useMemo, useState } from "react";
import { useRouteHandle } from "@/hooks";
import { UIModeChangeButton } from "./ui-mode-selector";
import UIModeModal from "./ui-mode-selector";

export default function Header() {
  const categories = useAtomValue(categoriesStateUpwrapped);
  const navigate = useNavigate();
  const location = useLocation();
  const [handle, match] = useRouteHandle();
  const currentUIMode = useAtomValue(uiModeState);
  const [, setUIMode] = useAtom(setUIModeState);
  const [showModeSelector, setShowModeSelector] = useState(false);

  const title = useMemo(() => {
    if (handle) {
      if (typeof handle.title === "function") {
        return handle.title({ categories, params: match.params });
      } else {
        return handle.title;
      }
    }
  }, [handle, categories]);

  const showBack = location.key !== "default" && handle?.back !== false;

  const handleModeChange = () => {
    setShowModeSelector(true);
  };

  const handleModeSelect = (mode: any) => {
    setShowModeSelector(false);
  };

  if (handle?.logo) {
    return (
      <div className="h-14 w-full flex items-center justify-between px-4 py-2">
        <img src={headerLogoImage} className="max-h-full flex-none" />
        {currentUIMode && (
          <UIModeChangeButton
            currentMode={currentUIMode}
            onModeChange={handleModeChange}
          />
        )}
        <UIModeModal isOpen={showModeSelector} onSelect={handleModeSelect} />
      </div>
    );
  }

  return (
    <div className="h-12 w-full flex items-center pl-2 pr-4 py-2 space-x-1">
      {showBack && (
        <div className="p-2 cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </div>
      )}
      <div className="text-xl font-medium truncate flex-1">{title}</div>
      {currentUIMode && (
        <UIModeChangeButton
          currentMode={currentUIMode}
          onModeChange={handleModeChange}
        />
      )}
      <UIModeModal isOpen={showModeSelector} onSelect={handleModeSelect} />
    </div>
  );
}
