import prisma from '../config/db';
import { AppError, ERROR_CODES } from '../utils/errors';

export const getAll = async () => {
  return prisma.priceListItem.findMany({
    include: { treatmentType: true },
  });
};

export const create = async (data: { treatmentTypeId: string; price: number }) => {
    // Check if exists
    const existing = await prisma.priceListItem.findUnique({
        where: { treatmentTypeId: data.treatmentTypeId }
    });
    if (existing) throw new AppError(ERROR_CODES.PRICE_ALREADY_EXISTS, 409);

    return prisma.priceListItem.create({
        data: {
            treatmentTypeId: data.treatmentTypeId,
            price: data.price
        },
        include: { treatmentType: true }
    });
};

export const update = async (id: string, price: number) => {
    // Check if exists first
    const existing = await prisma.priceListItem.findUnique({
        where: { id }
    });
    
    if (!existing) {
        throw new AppError(ERROR_CODES.PRICE_LIST_ITEM_NOT_FOUND, 404);
    }

    return prisma.priceListItem.update({
        where: { id },
        data: { price },
        include: { treatmentType: true }
    });
};

export const remove = async (id: string) => {
    // Check if exists first
    const existing = await prisma.priceListItem.findUnique({
        where: { id }
    });
    
    if (!existing) {
        throw new AppError(ERROR_CODES.PRICE_LIST_ITEM_NOT_FOUND, 404);
    }

    return prisma.priceListItem.delete({
        where: { id }
    });
};

