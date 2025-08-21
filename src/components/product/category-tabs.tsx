import { useAtom, useAtomValue } from "jotai";
import Tabs from "../common/tabs";
import { selectedTabIndexState, dynamicTabsState } from "@/state";

export default function CategoryTabs() {
  const tabs = useAtomValue(dynamicTabsState);
  const [selectedIndex, setSelectedIndex] = useAtom(selectedTabIndexState);

  return (
    <Tabs
      items={tabs}
      value={tabs[selectedIndex]}
      onChange={(tab) => setSelectedIndex(tabs.indexOf(tab))}
      renderLabel={(item) => item as string}
    />
  );
}
