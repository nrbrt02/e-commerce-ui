import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import { models, sequelize } from "../models";
import { OrderStatus, PaymentStatus } from "../models/Order";

// Destructure models from the imported models object
const { Order, OrderItem, Product } = models;

export const convertDraftToOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const draftId = parseInt(req.params.id);
    if (isNaN(draftId)) {
      throw new AppError("Invalid draft ID", 400);
    }

    const transaction = await sequelize.transaction();

    try {
      // Find the draft order
      const draftOrder = await Order.findByPk(draftId, {
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
        transaction,
      });

      if (!draftOrder) {
        throw new AppError("Draft order not found", 404);
      }

      // Log initial draft order state
      console.log('Initial draft order state:', {
        id: draftOrder.id,
        totalAmount: draftOrder.totalAmount,
        metadata: draftOrder.metadata,
        status: draftOrder.status,
        paymentStatus: draftOrder.paymentStatus
      });

      // Ensure it's a draft
      if (draftOrder.status !== OrderStatus.DRAFT) {
        throw new AppError("This order is not a draft", 400);
      }

      // Check if user owns this draft
      if (draftOrder.customerId !== req.user!.id) {
        throw new AppError(
          "You do not have permission to convert this draft",
          403
        );
      }

      // Validate required fields for a proper order
      if (!draftOrder.items || draftOrder.items.length === 0) {
        throw new AppError(
          "Draft order must contain at least one item to be converted",
          400
        );
      }

      if (!draftOrder.shippingAddress) {
        throw new AppError(
          "Shipping address is required to convert draft to order",
          400
        );
      }

      if (!draftOrder.billingAddress) {
        throw new AppError(
          "Billing address is required to convert draft to order",
          400
        );
      }

      // Check product inventory and update stock
      for (const item of draftOrder.items) {
        const product = item.product;

        if (!product.isPublished) {
          throw new AppError(
            `Product ${product.name} is not available for purchase`,
            400
          );
        }

        if (!product.isDigital && product.quantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${product.name}`,
            400
          );
        }

        // Update product stock if not digital
        if (!product.isDigital) {
          product.quantity -= item.quantity;
          await product.save({ transaction });
        }
      }

      // Generate a regular order number
      const generateOrderNumber = (): string => {
        const prefix = "ORD";
        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        return `${prefix}-${timestamp.substring(
          timestamp.length - 6
        )}${randomNum}`;
      };

      // Calculate total amount from items
      const totalAmount = draftOrder.items.reduce((sum, item) => {
        return sum + (item.subtotal + item.tax);
      }, 0);

      // Add shipping cost if present in metadata
      const shippingCost = draftOrder.metadata?.shipping || 0;
      const finalTotalAmount = totalAmount + shippingCost;

      // Prepare metadata with all necessary information
      const metadata = {
        ...(draftOrder.metadata || {}),
        isDraft: false,
        convertedFromDraft: true,
        draftOrderNumber: draftOrder.orderNumber,
        convertedAt: new Date().toISOString(),
        totalAmount: finalTotalAmount,
        paymentStatus: draftOrder.paymentStatus,
        paymentDetails: draftOrder.paymentDetails,
        originalTotalAmount: draftOrder.totalAmount // Keep original total for reference
      };

      // Log metadata before update
      console.log('Prepared metadata:', metadata);

      // Prepare update data
      const updateData = {
        orderNumber: generateOrderNumber(),
        status: OrderStatus.PENDING,
        paymentStatus: draftOrder.paymentStatus || PaymentStatus.PENDING,
        totalAmount: finalTotalAmount,
        metadata,
      };

      // Log update data before conversion
      console.log('Update data before conversion:', updateData);

      // Convert draft to regular order
      await draftOrder.update(updateData, { transaction });

      // Log draft order after update
      console.log('Draft order after update:', {
        id: draftOrder.id,
        totalAmount: draftOrder.totalAmount,
        metadata: draftOrder.metadata,
        status: draftOrder.status,
        paymentStatus: draftOrder.paymentStatus
      });

      // Commit transaction
      await transaction.commit();

      // Fetch the updated order with items
      const convertedOrder = await Order.findByPk(draftOrder.id, {
        include: [
          {
            model: OrderItem,
            as: "items",
          },
        ],
      });

      // Log final converted order
      console.log('Final converted order:', {
        id: convertedOrder.id,
        totalAmount: convertedOrder.totalAmount,
        metadata: convertedOrder.metadata,
        status: convertedOrder.status,
        paymentStatus: convertedOrder.paymentStatus
      });

      res.status(200).json({
        status: "success",
        data: {
          order: convertedOrder,
        },
      });
    } catch (error) {
      // Log any errors
      console.error('Error converting draft to order:', error);
      
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }
); 