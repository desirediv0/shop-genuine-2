import slugify from "slugify";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { processAndUploadImage } from "../middlewares/multer.middlerware.js";
import { prisma } from "../config/db.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { deleteFromS3, getFileUrl } from "../utils/deleteFromS3.js";

// Create Store Vertical
export const createStoreVertical = asyncHandler(async (req, res) => {
  const { name, order, isActive } = req.body;
  if (!name) throw new ApiError(400, "Store vertical name is required");
  const slug = slugify(name, { lower: true });

  let image = null;
  if (req.file) {
    image = await processAndUploadImage(req.file, "store-verticals");
  } else {
    throw new ApiError(400, "Store vertical image is required");
  }

  const storeVertical = await prisma.storeVertical.create({
    data: {
      name,
      slug,
      image,
      order: order !== undefined ? parseInt(order) : 0,
      isActive:
        isActive === undefined
          ? true
          : isActive === "true" || isActive === true,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponsive(
        201,
        { storeVertical },
        "Store vertical created successfully"
      )
    );
});

// Update Store Vertical
export const updateStoreVertical = asyncHandler(async (req, res) => {
  const { storeVerticalId } = req.params;
  const { name, order, isActive } = req.body;

  const storeVertical = await prisma.storeVertical.findUnique({
    where: { id: storeVerticalId },
  });
  if (!storeVertical) throw new ApiError(404, "Store vertical not found");

  let updateData = {};
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name, { lower: true });
  }
  if (order !== undefined) {
    updateData.order = parseInt(order);
  }
  if (isActive !== undefined) {
    updateData.isActive = isActive === "true" || isActive === true;
  }
  if (req.file) {
    if (storeVertical.image) await deleteFromS3(storeVertical.image);
    updateData.image = await processAndUploadImage(
      req.file,
      "store-verticals"
    );
  }

  const updatedStoreVertical = await prisma.storeVertical.update({
    where: { id: storeVerticalId },
    data: updateData,
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { storeVertical: updatedStoreVertical },
        "Store vertical updated successfully"
      )
    );
});

// Delete Store Vertical
export const deleteStoreVertical = asyncHandler(async (req, res) => {
  const { storeVerticalId } = req.params;

  const storeVertical = await prisma.storeVertical.findUnique({
    where: { id: storeVerticalId },
    include: { products: true },
  });
  if (!storeVertical) throw new ApiError(404, "Store vertical not found");

  // Unlink all products from this store vertical
  await prisma.product.updateMany({
    where: { storeVerticalId },
    data: { storeVerticalId: null },
  });

  // Delete store vertical image from S3 if exists
  if (storeVertical.image) await deleteFromS3(storeVertical.image);

  await prisma.storeVertical.delete({ where: { id: storeVerticalId } });

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Store vertical deleted successfully"));
});

// Get All Store Verticals (admin - includes inactive)
export const getStoreVerticals = asyncHandler(async (req, res) => {
  const storeVerticals = await prisma.storeVertical.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const data = storeVerticals.map((sv) => ({
    ...sv,
    image: sv.image ? getFileUrl(sv.image) : null,
    productCount: sv._count?.products || 0,
  }));

  res
    .status(200)
    .json(
      new ApiResponsive(200, { storeVerticals: data }, "Store verticals fetched")
    );
});

// Get Store Vertical By Id
export const getStoreVerticalById = asyncHandler(async (req, res) => {
  const { storeVerticalId } = req.params;
  const storeVertical = await prisma.storeVertical.findUnique({
    where: { id: storeVerticalId },
    include: { products: true },
  });
  if (!storeVertical) throw new ApiError(404, "Store vertical not found");
  res
    .status(200)
    .json(new ApiResponsive(200, { storeVertical }, "Store vertical fetched"));
});

// Toggle Store Vertical active status
export const toggleStoreVerticalStatus = asyncHandler(async (req, res) => {
  const { storeVerticalId } = req.params;
  const storeVertical = await prisma.storeVertical.findUnique({
    where: { id: storeVerticalId },
  });
  if (!storeVertical) throw new ApiError(404, "Store vertical not found");

  const updated = await prisma.storeVertical.update({
    where: { id: storeVerticalId },
    data: { isActive: !storeVertical.isActive },
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { storeVertical: updated },
        "Store vertical status updated"
      )
    );
});

// Reorder store verticals - accepts { items: [{ id, order }, ...] }
export const reorderStoreVerticals = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "items array with { id, order } pairs is required");
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.storeVertical.update({
        where: { id: item.id },
        data: { order: parseInt(item.order) },
      })
    )
  );

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Store verticals reordered successfully"));
});
