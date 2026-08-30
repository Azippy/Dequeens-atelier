import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";
import Category from "../models/category.model.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      category,
      subCategory,
      gender,
      sizes,
      colors,
      stock,
      isReadyToWear,
      isBespoke,
      isFeatured,
    } = req.body;

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, "dequeens-atelier/products"),
        ),
      );

      imageUrls = uploadedImages.map((image) => ({
        url: image.secure_url,
        publicId: image.public_id,
      }));
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      subCategory,
      gender,
      sizes,
      colors,
      images: imageUrls,
      stock,
      isReadyToWear,
      isBespoke,
      isFeatured,
    });
    await createAuditLog({
      admin: req.user._id,

      action: "CREATE",

      resource: "Product",

      resourceId: product._id,

      description: `Created product ${product.name}`,

      metadata: {
        productName: product.name,
      },

      req,
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      gender,
      minPrice,
      maxPrice,
      featured,
      readyToWear,
      bespoke,
      page = 1,
      limit = 12,
      sort = "-createdAt",
    } = req.query;

    const query = {
      isActive: true,
    };

    // Search
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category
    if (category) {
      query.category = category;
    }

    // Gender
    if (gender) {
      query.gender = gender;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Featured
    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }

    // Ready-to-wear
    if (readyToWear !== undefined) {
      query.isReadyToWear = readyToWear === "true";
    }

    // Bespoke
    if (bespoke !== undefined) {
      query.isBespoke = bespoke === "true";
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),

      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      status: "success",

      results: products.length,

      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalProducts,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },

      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).populate("category", "name slug");

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.status(200).json({
      status: "success",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "name",
      "slug",
      "description",
      "price",
      "category",
      "subCategory",
      "gender",
      "sizes",
      "colors",
      "images",
      "stock",
      "isReadyToWear",
      "isBespoke",
      "isFeatured",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) {
      throw new AppError("Product not found", 404);
    }
    await createAuditLog({
      admin: req.user._id,

      action: "UPDATE",

      resource: "Product",

      resourceId: product._id,

      description: `Updated product ${product.name}`,

      req,
    });

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }
    await createAuditLog({
      admin: req.user._id,

      action: "DELETE",

      resource: "Product",

      resourceId: product._id,

      description: `Deleted product ${product.name}`,

      req,
    });
    res.status(200).json({
      status: "success",
      message: "Product removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
