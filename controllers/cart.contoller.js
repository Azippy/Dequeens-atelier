import Cart from "../models/cart.js";
import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      select: "name price images sizes colors stock isReadyToWear isBespoke",
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.status(200).json({
      status: "success",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (!product.isReadyToWear) {
      throw new AppError(
        "This product is not available for direct purchase",
        400,
      );
    }

    if (quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} item(s) available`, 400);
    }

    // Check size
    if (size && product.sizes.length > 0 && !product.sizes.includes(size)) {
      throw new AppError("Selected size is not available", 400);
    }

    // Check color
    if (color && product.colors.length > 0 && !product.colors.includes(color)) {
      throw new AppError("Selected color is not available", 400);
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + Number(quantity);

      if (newQuantity > product.stock) {
        throw new AppError(`Only ${product.stock} item(s) available`, 400);
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        size,
        color,
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price images sizes colors stock isReadyToWear isBespoke",
    });

    res.status(200).json({
      status: "success",
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item = cart.items.id(itemId);

    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      throw new AppError("Product is no longer available", 400);
    }

    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} item(s) available`, 400);
    }

    item.quantity = Number(quantity);

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price images sizes colors stock isReadyToWear isBespoke",
    });

    res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item = cart.items.id(itemId);

    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    item.deleteOne();

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Item removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};
