import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        cognitoId,
      },
      include: {
        favorites: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({ message: "Error fetching tenant" });
  }
};

export const createTenant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Error creating tenant" });
  }
};

export const updateTenant = async (
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

    const tenant = await prisma.tenant.update({
      where: {
        cognitoId,
      },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ message: "Error updating tenant" });
  }
};
