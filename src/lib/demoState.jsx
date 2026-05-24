import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildTasks, demoProfile } from "../data/mockData";
import { welcomeMessage } from "../data/prompts";
import { createDiagnosis, createReview } from "./mockAgent";

const DemoContext = createContext(null);
const storageKey = "yantu-agent-demo-state";
const initialSchoolId = "south-finance";

function makeInitialState() {
  return {
    profile: demoProfile,
    diagnosis: createDiagnosis(demoProfile),
    selectedSchoolId: initialSchoolId,
    hasSelectedReportTarget: false,
    tasks: buildTasks(initialSchoolId),
    chatHistory: [welcomeMessage],
    reviewResult: null,
  };
}

function readState() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return makeInitialState();

    const parsed = JSON.parse(stored);
    return {
      ...makeInitialState(),
      ...parsed,
      hasSelectedReportTarget: parsed.hasSelectedReportTarget === true,
    };
  } catch {
    return makeInitialState();
  }
}

export function DemoProvider({ children }) {
  const [state, setState] = useState(readState);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      submitProfile(profile) {
        setState((current) => ({
          ...current,
          profile,
          diagnosis: createDiagnosis(profile),
          hasSelectedReportTarget: false,
          reviewResult: null,
        }));
      },
      selectSchool(schoolId) {
        setState((current) => ({
          ...current,
          selectedSchoolId: schoolId,
          hasSelectedReportTarget: true,
          tasks: buildTasks(schoolId),
          reviewResult: null,
        }));
      },
      toggleTask(taskId) {
        setState((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task,
          ),
        }));
      },
      addChatMessage(message) {
        setState((current) => ({
          ...current,
          chatHistory: [...current.chatHistory, message],
        }));
      },
      submitReview(review) {
        setState((current) => ({
          ...current,
          reviewResult: createReview({ ...review, tasks: current.tasks }),
        }));
      },
      resetDemo() {
        setState(makeInitialState());
      },
    }),
    [state],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error("useDemo must be used inside DemoProvider");
  }

  return context;
}
