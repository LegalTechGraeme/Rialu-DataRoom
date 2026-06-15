import { Router } from "express";
import { DEMO_USERS } from "../demoUsers.js";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  addTaskComment,
  getTaskSummary,
  seedDemoTasksIfEmpty,
} from "../taskStore.js";

/**
 * @param {(matterId: string) => import('../types.js').DocumentRecord[]} getDocuments
 * @param {(matterId: string) => object | null} getFolderNameMap
 */
export function createTaskRouter(getDocuments, getFolderNameMap) {
  const router = Router();

  router.get("/users", (_req, res) => {
    res.json({ users: DEMO_USERS });
  });

  router.get("/matters/:matterId/tasks", (req, res) => {
    const { assignedTo, createdBy, status, documentId, folderId } = req.query;
    const docs = getDocuments(req.params.matterId);
    const folderMap = getFolderNameMap(req.params.matterId) ?? {};
    seedDemoTasksIfEmpty(req.params.matterId, docs, folderMap);
    const tasks = listTasks(req.params.matterId, {
      assignedTo: typeof assignedTo === "string" ? assignedTo : undefined,
      createdBy: typeof createdBy === "string" ? createdBy : undefined,
      status: typeof status === "string" ? status : undefined,
      documentId: typeof documentId === "string" ? documentId : undefined,
      folderId: typeof folderId === "string" ? folderId : undefined,
    });
    res.json({ tasks });
  });

  router.get("/matters/:matterId/tasks/summary", (req, res) => {
    const docs = getDocuments(req.params.matterId);
    const folderMap = getFolderNameMap(req.params.matterId) ?? {};
    seedDemoTasksIfEmpty(req.params.matterId, docs, folderMap);
    res.json({ summary: getTaskSummary(req.params.matterId) });
  });

  router.get("/matters/:matterId/tasks/:taskId", (req, res) => {
    const task = getTask(req.params.matterId, req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ task });
  });

  router.post("/matters/:matterId/tasks", (req, res) => {
    try {
      const body = req.body ?? {};
      if (!body.title || !body.createdBy || !body.assignedTo) {
        return res.status(400).json({ error: "title, createdBy, and assignedTo are required" });
      }
      const task = createTask(req.params.matterId, body);
      res.status(201).json({ task });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Failed to create task" });
    }
  });

  router.patch("/matters/:matterId/tasks/:taskId", (req, res) => {
    try {
      const task = updateTask(
        req.params.matterId,
        req.params.taskId,
        req.body ?? {},
        req.body?.actorId
      );
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json({ task });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Failed to update task" });
    }
  });

  router.post("/matters/:matterId/tasks/:taskId/comments", (req, res) => {
    try {
      const { authorId, body } = req.body ?? {};
      if (!authorId || !body?.trim()) {
        return res.status(400).json({ error: "authorId and body are required" });
      }
      const result = addTaskComment(req.params.matterId, req.params.taskId, {
        authorId,
        body,
      });
      if (!result) return res.status(404).json({ error: "Task not found" });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Failed to add comment" });
    }
  });

  return router;
}
