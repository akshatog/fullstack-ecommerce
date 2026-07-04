import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
    try {
        const wishlistItems = await prisma.wishlistItem.findMany({
            where: {
                userId: req.user.userId
            },
            include: {
                product: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(wishlistItems);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Server error fetching wishlist." });
    }
});

// Toggle wishlist item (add/remove)
router.post('/toggle', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required." });
        }

        // Check if the product exists in wishlist
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.userId,
                    productId: parseInt(productId)
                }
            }
        });

        if (existingItem) {
            // Remove it
            await prisma.wishlistItem.delete({
                where: {
                    id: existingItem.id
                }
            });
            res.json({ message: "Product removed from wishlist", wishlisted: false });
        } else {
            // Add it
            const newItem = await prisma.wishlistItem.create({
                data: {
                    userId: req.user.userId,
                    productId: parseInt(productId)
                },
                include: {
                    product: true
                }
            });
            res.status(201).json({ message: "Product added to wishlist", wishlisted: true, item: newItem });
        }

    } catch (error) {
        console.error("Error toggling wishlist item:", error);
        res.status(500).json({ message: "Server error updating wishlist." });
    }
});

export default router;
