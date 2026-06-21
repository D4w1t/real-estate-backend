import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

export const getManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const manager = await prisma.manager.findUnique({
      where: {
        cognitoId,
      },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: "Manager not found" });
    }
  } catch (error: any) {
    console.error("Error fetching manager:", error);
    res.status(500).json({ message: "Error fetching manager" });
  }
};

export const createManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    console.error("Error creating manager:", error);
    res.status(500).json({ message: "Error creating manager" });
  }
};

export const updateManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const manager = await prisma.manager.update({
      where: {
        cognitoId,
      },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    console.error("Error updating manager:", error);
    res.status(500).json({ message: "Error updating manager" });
  }
};
