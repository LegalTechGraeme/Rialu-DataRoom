import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { DEMO_USERS, getDemoUser } from "./demoUsers.js";
import { addActivity } from "./matterStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_DIR = path.resolve(__dirname, "../data/tasks");

function ensureDir() {
  if (!fs.existsSync(TASKS_DIR)) fs.mkdirSync(TASKS_DIR, { recursive: true });
}

function taskFile(matterId) {
  return path.join(TASKS_DIR, `${matterId}.json`);
}

function readStore(matterId) {
  ensureDir();
  const file = taskFile(matterId);
  if (!fs.existsSync(file)) return { tasks: [] };
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { tasks: [] };
  }
}

function writeStore(matterId, store) {
  ensureDir();
  fs.writeFileSync(taskFile(matterId), JSON.stringify(store, null, 2));
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

/** @param {string} matterId */
export function listTasks(matterId, filters = {}) {
  const { tasks } = readStore(matterId);
  let list = [...tasks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  if (filters.assignedTo) {
    list = list.filter((t) => t.assignedTo === filters.assignedTo);
  }
  if (filters.createdBy) {
    list = list.filter((t) => t.createdBy === filters.createdBy);
  }
  if (filters.status) {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters.documentId) {
    list = list.filter((t) => t.documentId === filters.documentId);
  }
  if (filters.folderId) {
    list = list.filter((t) => t.folderId === filters.folderId);
  }
  return list;
}

/** @param {string} matterId @param {string} taskId */
export function getTask(matterId, taskId) {
  const { tasks } = readStore(matterId);
  return tasks.find((t) => t.id === taskId) ?? null;
}

/**
 * @param {string} matterId
 * @param {object} input
 */
export function createTask(matterId, input) {
  const store = readStore(matterId);
  const creator = getDemoUser(input.createdBy);
  const assignee = getDemoUser(input.assignedTo);
  if (!creator) throw new Error("Invalid creator");
  if (!assignee) throw new Error("Invalid assignee");

  const now = new Date().toISOString();
  const task = {
    id: newId("task"),
    matterId,
    type: input.type ?? "document_review",
    title: input.title,
    description: input.description ?? "",
    status: input.status ?? "open",
    priority: input.priority ?? "normal",
    createdBy: creator.id,
    createdByName: creator.name,
    createdByRole: creator.role,
    assignedTo: assignee.id,
    assignedToName: assignee.name,
    assignedToRole: assignee.role,
    documentId: input.documentId ?? null,
    documentName: input.documentName ?? null,
    folderId: input.folderId ?? null,
    folderName: input.folderName ?? null,
    clauseRef: input.clauseRef ?? null,
    selectedText: input.selectedText ?? null,
    textStart: input.textStart ?? null,
    textEnd: input.textEnd ?? null,
    parentTaskId: input.parentTaskId ?? null,
    comments: [],
    createdAt: now,
    updatedAt: now,
  };

  store.tasks.push(task);
  writeStore(matterId, store);

  addActivity(matterId, {
    id: newId("act"),
    kind: "comment",
    message: `${creator.name} assigned "${task.title}" to ${assignee.name}`,
    occurredAt: now,
    actorLabel: creator.name,
  });

  return task;
}

/**
 * @param {string} matterId
 * @param {string} taskId
 * @param {object} patch
 * @param {string} [actorId]
 */
export function updateTask(matterId, taskId, patch, actorId) {
  const store = readStore(matterId);
  const idx = store.tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;

  const task = store.tasks[idx];
  const actor = actorId ? getDemoUser(actorId) : null;
  const now = new Date().toISOString();

  if (patch.status && patch.status !== task.status) {
    task.status = patch.status;
    const label = actor?.name ?? "System";
    addActivity(matterId, {
      id: newId("act"),
      kind: "review",
      message: `${label} marked "${task.title}" as ${patch.status.replace("_", " ")}`,
      occurredAt: now,
      actorLabel: label,
    });
  }

  if (patch.assignedTo && patch.assignedTo !== task.assignedTo) {
    const assignee = getDemoUser(patch.assignedTo);
    if (!assignee) throw new Error("Invalid assignee");
    task.assignedTo = assignee.id;
    task.assignedToName = assignee.name;
    task.assignedToRole = assignee.role;
    const label = actor?.name ?? "System";
    addActivity(matterId, {
      id: newId("act"),
      kind: "comment",
      message: `${label} reassigned "${task.title}" to ${assignee.name}`,
      occurredAt: now,
      actorLabel: label,
    });
  }

  if (patch.priority) task.priority = patch.priority;
  if (patch.title) task.title = patch.title;
  if (patch.description !== undefined) task.description = patch.description;

  task.updatedAt = now;
  store.tasks[idx] = task;
  writeStore(matterId, store);
  return task;
}

/**
 * @param {string} matterId
 * @param {string} taskId
 * @param {{ authorId: string; body: string }} input
 */
export function addTaskComment(matterId, taskId, input) {
  const store = readStore(matterId);
  const idx = store.tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;

  const author = getDemoUser(input.authorId);
  if (!author) throw new Error("Invalid author");

  const now = new Date().toISOString();
  const comment = {
    id: newId("cmt"),
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    body: input.body.trim(),
    createdAt: now,
  };

  store.tasks[idx].comments.push(comment);
  store.tasks[idx].updatedAt = now;
  writeStore(matterId, store);
  return { task: store.tasks[idx], comment };
}

/** @param {string} matterId */
export function getTaskSummary(matterId) {
  const tasks = listTasks(matterId);
  const byUser = {};
  for (const u of DEMO_USERS) {
    byUser[u.id] = {
      user: u,
      assigned: tasks.filter((t) => t.assignedTo === u.id && t.status !== "completed").length,
      created: tasks.filter((t) => t.createdBy === u.id).length,
      open: tasks.filter((t) => t.assignedTo === u.id && t.status === "open").length,
      inProgress: tasks.filter((t) => t.assignedTo === u.id && t.status === "in_progress").length,
      awaitingReview: tasks.filter(
        (t) => t.assignedTo === u.id && t.status === "awaiting_review"
      ).length,
    };
  }
  return {
    total: tasks.length,
    open: tasks.filter((t) => t.status !== "completed").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    byUser,
  };
}

/** Seed demo tasks for matter-acme if empty */
export function seedDemoTasksIfEmpty(matterId, documents = [], folderMap = {}) {
  const store = readStore(matterId);
  if (store.tasks.length > 0) return store.tasks;

  const findDoc = (pattern) =>
    documents.find((d) => d.fileName.toLowerCase().includes(pattern.toLowerCase()));

  const seeds = [];
  const saas = findDoc("saas_agreement") ?? findDoc("master_subscription");
  const emp = findDoc("employment") ?? findDoc("offer_letter");
  const corp = findDoc("articles") ?? findDoc("shareholders");

  if (saas) {
    seeds.push({
      type: "clause_review",
      title: "Review change-of-control clause",
      description:
        "Trainee to summarise the change-of-control trigger and consent requirements in the MSA.",
      priority: "high",
      createdBy: "user-senior",
      assignedTo: "user-trainee",
      documentId: saas.id,
      documentName: saas.fileName,
      clauseRef: "§12 — Change of Control",
      selectedText:
        "Change of Control means any transaction resulting in a change of more than 50% of voting securities...",
      status: "in_progress",
    });
    seeds.push({
      type: "escalation",
      title: "Escalation: liability cap adequacy",
      description:
        "Associate flagged uncapped indirect damages carve-out — needs senior review before sign-off.",
      priority: "urgent",
      createdBy: "user-associate",
      assignedTo: "user-senior",
      documentId: saas.id,
      documentName: saas.fileName,
      clauseRef: "§9 — Limitation of Liability",
      status: "awaiting_review",
    });
  }

  if (emp) {
    const folderName = folderMap[emp.folderId] ?? "Employment";
    seeds.push({
      type: "folder_review",
      title: `Complete employment folder review`,
      description: `Review all contracts in ${folderName} for restrictive covenant consistency.`,
      priority: "normal",
      createdBy: "user-partner",
      assignedTo: "user-associate",
      folderId: emp.folderId,
      folderName,
      status: "open",
    });
  }

  if (corp) {
    seeds.push({
      type: "document_review",
      title: "Corporate constitution review",
      description: "Confirm share classes, pre-emption rights, and director appointment mechanics.",
      priority: "normal",
      createdBy: "user-senior",
      assignedTo: "user-associate",
      documentId: corp.id,
      documentName: corp.fileName,
      status: "open",
    });
  }

  for (const seed of seeds) {
    try {
      createTask(matterId, seed);
    } catch {
      /* ignore seed failures */
    }
  }

  return readStore(matterId).tasks;
}
