import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import { createStore, type ProjectContext, type WorkspaceContext } from "@algolens/core";
import type { StaticAnalysisResult } from "@algolens/analyzer";

interface VsCodeApi {
  postMessage(message: unknown): void;
}

interface WorkspaceContextMessage {
  readonly type: "algolens.workspaceContext";
  readonly payload: WorkspaceContext;
}

interface AnalysisResultMessage {
  readonly type: "algolens.analysisResult";
  readonly payload: StaticAnalysisResult;
}

export interface AnalysisState {
  readonly result: StaticAnalysisResult | undefined;
}

function getVsCodeApi(): VsCodeApi | undefined {
  const candidate = (globalThis as { acquireVsCodeApi?: () => VsCodeApi }).acquireVsCodeApi;

  return candidate ? candidate() : undefined;
}

function toProjectContext(context: WorkspaceContext): ProjectContext {
  return {
    projectName: context.workspaceName ?? "No workspace",
    currentFile: context.selectedFile ?? "No file selected",
    language: context.language ?? "Unknown",
    scanStatus: "complete",
  };
}

const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  projectName: "Loadingâ€¦",
  currentFile: "No file selected",
  language: "Unknown",
  scanStatus: "idle",
};

const StoreContext = createContext(createStore<ProjectContext>(DEFAULT_PROJECT_CONTEXT));

const AnalysisContext = createContext<AnalysisState>({
  result: undefined,
});

export function StoreProvider({ children }: { readonly children: ReactNode }): ReactElement {
  const storeRef = useRef(createStore<ProjectContext>(DEFAULT_PROJECT_CONTEXT));
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    result: undefined,
  });

  useEffect(() => {
    const vscode = getVsCodeApi();
    if (!vscode) {
      return;
    }

    const handleMessage = (
      event: MessageEvent<WorkspaceContextMessage | AnalysisResultMessage>
    ) => {
      if (event.data.type === "algolens.workspaceContext") {
        storeRef.current.setState(toProjectContext(event.data.payload));
        return;
      }

      setAnalysisState({
        result: event.data.payload,
      });
    };

    window.addEventListener("message", handleMessage);
    vscode.postMessage({ type: "algolens.ready" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <StoreContext.Provider value={storeRef.current}>
      <AnalysisContext.Provider value={analysisState}>{children}</AnalysisContext.Provider>
    </StoreContext.Provider>
  );
}

/** Reads the current {@link ProjectContext}, re-rendering on store updates. */
export function useProjectContext(): ProjectContext {
  const store = useContext(StoreContext);
  return useSyncExternalStore(store.subscribe, store.getState);
}

/** Reads the latest static analysis result. */
export function useAnalysisResult(): StaticAnalysisResult | undefined {
  return useContext(AnalysisContext).result;
}
