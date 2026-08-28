import Category from "../models/category.model.js";
import AppError from "../utils/appError.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image } = req.body;

    const category = await Category.create({
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      status: "success",
      results: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};
