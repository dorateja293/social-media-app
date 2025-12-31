import Notification from "../models/Notification.js";

const createNotification = async ({ user, sender, type, post }) => {
  if (user.toString() === sender.toString()) return;

  await Notification.create({
    user,
    sender,
    type,
    post
  });
};

export default createNotification;
