import nodemailer from 'nodemailer';
import prisma from '../shared/prisma';
import { NotificationService } from '../modules/notification/notification.service';

const config = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport(config);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const handleMentions = async (content: string, workspaceId: string, authorName: string, sourceTitle: string) => {
  const mentions = content.match(/@(\w+)/g);
  if (!mentions) return;

  const mentionNames = mentions.map(m => m.slice(1).toLowerCase());
  
  // Find members whose names match the mentions
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  for (const member of members) {
    if (mentionNames.includes(member.user.name.toLowerCase().replace(/\s+/g, ''))) {
      // 1. Send Email
      const template = getMentionTemplate(authorName, content, sourceTitle);
      sendEmail(
        member.user.email,
        `You were mentioned by ${authorName}`,
        template
      ).catch(e => console.error('Email failed:', e));

      // 2. Create In-App Notification
      NotificationService.createNotification({
        userId: member.user.id,
        type: 'MENTION',
        content: `${authorName} mentioned you in "${sourceTitle}"`,
      }).catch(e => console.error('Notification failed:', e));
    }
  }
};

const getInvitationTemplate = (workspaceName: string, inviterName: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 12px; background: #ffffff; color: #000000; border-radius: 12px; font-weight: 900; font-size: 24px;">T</div>
      <h1 style="font-size: 24px; font-weight: 900; margin-top: 20px; tracking-tight: -0.05em;">TEAMHUB</h1>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 15px;">You've been invited!</h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
        <strong>${inviterName}</strong> has invited you to collaborate in the <strong>${workspaceName}</strong> workspace.
      </p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.CLIENT_URL}/workspaces" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;">
          Join Workspace
        </a>
      </div>
    </div>
    <p style="margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
      Sent via TeamHub Automated Systems
    </p>
  </div>
`;

const getMentionTemplate = (authorName: string, content: string, announcementTitle: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 12px; background: #3b82f6; color: #ffffff; border-radius: 12px; font-weight: 900; font-size: 24px;">@</div>
      <h1 style="font-size: 24px; font-weight: 900; margin-top: 20px; tracking-tight: -0.05em;">MENTIONED</h1>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
        <strong>${authorName}</strong> mentioned you in <strong>${announcementTitle}</strong>:
      </p>
      <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.02); border-left: 4px solid #3b82f6; color: #cbd5e1; font-style: italic; border-radius: 0 12px 12px 0;">
        "${content}"
      </div>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.CLIENT_URL}/announcements" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;">
          View Discussion
        </a>
      </div>
    </div>
    <p style="margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
      Sent via TeamHub Automated Systems
    </p>
  </div>
`;

const getTaskAssignmentTemplate = (assignerName: string, taskTitle: string, priority: string, dueDate?: string) => `
  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 12px; background: #ffffff; color: #000000; border-radius: 12px; font-weight: 900; font-size: 24px;">T</div>
      <h1 style="font-size: 24px; font-weight: 900; margin-top: 20px;">NEW TASK</h1>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 15px;">You have a new assignment</h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
        <strong>${assignerName}</strong> assigned you a new task:
      </p>
      <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;">
        <p style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff;">${taskTitle}</p>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
          <span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase;">${priority} Priority</span>
          ${dueDate ? `<span style="background: rgba(255, 255, 255, 0.05); color: #94a3b8; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Due: ${new Date(dueDate).toLocaleDateString()}</span>` : ''}
        </div>
      </div>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.CLIENT_URL}/tasks" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">
          Open Board
        </a>
      </div>
    </div>
  </div>
`;

export const EmailHelper = {
  sendEmail,
  getInvitationTemplate,
  getMentionTemplate,
  getTaskAssignmentTemplate,
  handleMentions,
};
