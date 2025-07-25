import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useEffect } from "react";
import HistoryComponent from "./component";
import useHistoryController from "./controller";

export default function HistoryContainer() {
  const { currentUserId, interactionVersion } = useReduxSelectors();
  const { history, fetchHistory } = useHistoryController();

  useEffect(() => {
    if (!currentUserId) return;
    fetchHistory(currentUserId);
  }, [currentUserId]);

  return (
    <HistoryComponent
      history={history}
      interactionVersion={interactionVersion}
    />
  );
}
