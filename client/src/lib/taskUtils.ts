import type { ReviewTask } from "../types/workflow";

export function taskHasTaggedPassage(task: ReviewTask): boolean {
  return Boolean(
    task.selectedText?.trim() ||
      (task.textStart != null && task.textEnd != null && task.textEnd > task.textStart)
  );
}
