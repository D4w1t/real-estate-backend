import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { wktToGeoJSON } from "@terraformer/wkt";

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

export const getCurrentResidences = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const properties = await prisma.property.findMany({
      where: {
        tenants: {
          some: {
            cognitoId,
          },
        },
      },
      include: {
        location: true,
      },
    });

    const residencesWithFormattedCoordinates = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
          SELECT ST_AsText(coordinates) as coordinates
          FROM "Location"
          WHERE id = ${property.location.id}
        `;

        const geoJson: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJson.coordinates[0];
        const latitude = geoJson.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      }),
    );

    res.json(residencesWithFormattedCoordinates);
  } catch (error: any) {
    console.error("Error fetching current residences:", error);
    res.status(500).json({ message: "Error fetching current residences" });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId = (req as any).user?.id;
    const { propertyId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant?.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });

      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error: any) {
    console.error("Error adding favorite property:", error);
    res.status(500).json({ message: "Error adding favorite property" });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId = (req as any).user?.id;
    const { propertyId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }
    const propertyIdNumber = Number(propertyId);

    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      select: { id: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    console.error("Error removing favorite property:", err);
    res.status(500).json({ message: "Error removing favorite property" });
  }
};
