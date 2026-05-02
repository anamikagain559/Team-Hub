import prisma from '../../shared/prisma';
import { SocketHelper } from '../../helper/socketHelper';

const createNotification = async (data: {
  userId: string;
  type: string;
  content: string;
}) => {
  const result = await prisma.notification.create({
    data,
  });

  // Emit Socket Event to the specific user
  SocketHelper.emitToUser(data.userId, 'new_notification', result);

  return result;
};

const getMyNotifications = async (userId: string) => {
  const result = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return result;
};

const markAsRead = async (notificationId: string) => {
  const result = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return result;
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  markAsRead,
};
