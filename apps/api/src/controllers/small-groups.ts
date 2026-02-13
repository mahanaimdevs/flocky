import type { Request, Response } from "express";

import * as smallGroupsService from "../services/small-groups.js";

export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const group = await smallGroupsService.create({ name });
    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating small group:", error);
    res.status(500).json({ error: "Failed to create small group" });
  }
};

export const getRecent = async (req: Request, res: Response) => {
  try {
    const group = await smallGroupsService.getRecent();
    if (!group) {
      res.status(404).json({ error: "No small groups found" });
      return;
    }
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching last inserted small group:", error);
    res.status(500).json({ error: "Failed to fetch small group" });
  }
};
