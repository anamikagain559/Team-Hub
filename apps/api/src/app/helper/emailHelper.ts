import nodemailer from 'nodemailer';
import prisma from '../shared/prisma';
import { NotificationService } from '../modules/notification/notification.service';

const sendEmail = async (to: string, subject: string, html: string) => {
  const isGmail = process.env.EMAIL_USER?.includes('@gmail.com') || process.env.EMAIL_HOST?.includes('gmail');

  let config: any;

  if (isGmail) {
    config = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 20000, // Increase to 20s
      logger: true,
      debug: true
    };
  } else {
    config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    };
  }

  const transporter = nodemailer.createTransport(config);

  console.log(`[EmailService] Sending email to: ${to} | Subject: ${subject}`);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  console.log(`[EmailService] Email sent successfully to ${to}`);
};

const handleMentions = async (content: string, workspaceId: string, authorName: string, sourceTitle: string) => {
  try {
    const mentions = content.match(/@(\w+)/g);
    if (!mentions) return;

    const mentionNames = Array.from(new Set(mentions.map(m => m.slice(1).toLowerCase())));

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    const notifiedUserIds = new Set<string>();

    for (const member of members) {
      const normalizedMemberName = member.user.name.toLowerCase().replace(/\s+/g, '');

      if (mentionNames.includes(normalizedMemberName) && !notifiedUserIds.has(member.user.id)) {
        notifiedUserIds.add(member.user.id);

        console.log(`[MentionService] Notifying user: ${member.user.name} (${member.user.email})`);

        // 1. Send Email
        const template = getMentionTemplate(authorName, content, sourceTitle);
        await sendEmail(
          member.user.email,
          `You were mentioned by ${authorName}`,
          template
        ).catch(e => console.error('[EmailError]:', e));

        // 2. Create In-App Notification
        await NotificationService.createNotification({
          userId: member.user.id,
          type: 'MENTION',
          content: `${authorName} mentioned you in "${sourceTitle}"`,
        }).catch(e => console.error('[NotificationError]:', e));
      }
    }
  } catch (error) {
    console.error('[HandleMentions Error]:', error);
  }
};

const getInvitationTemplate = (workspaceName: string, inviterName: string) => `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; padding: 0; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #0f172a; padding: 32px; text-align: center;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #3b82f6; color: #ffffff; border-radius: 12px; line-height: 48px; font-weight: 900; font-size: 24px;">H</div>
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 16px; margin-bottom: 0; letter-spacing: -0.025em;">TEAMHUB OFFICIAL</h1>
    </div>
    <div style="padding: 40px; line-height: 1.6;">
      <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px;">Workspace Invitation</h2>
      <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
        Hello, <br><br>
        <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on TeamHub. Collaborating with your team has never been easier.
      </p>
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #f3f4f6; margin-bottom: 32px;">
        <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Workspace</p>
        <p style="margin: 4px 0 0; font-size: 18px; color: #111827; font-weight: 700;">${workspaceName}</p>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/workspaces" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; transition: background-color 0.2s;">
          Accept Invitation
        </a>
      </div>
      <p style="font-size: 14px; color: #9ca3af; margin-top: 32px; text-align: center;">
        If you weren't expecting this invitation, you can safely ignore this email.
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 500;">
        &copy; ${new Date().getFullYear()} TeamHub Inc. All rights reserved. <br>
        Official Workspace Notification
      </p>
    </div>
  </div>
`;

const getMentionTemplate = (authorName: string, content: string, announcementTitle: string) => `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; padding: 0; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
    <div style="background-color: #3b82f6; padding: 24px; text-align: left; display: flex; align-items: center;">
      <div style="display: inline-block; width: 32px; height: 32px; background-color: rgba(255,255,255,0.2); color: #ffffff; border-radius: 8px; text-align: center; line-height: 32px; font-weight: 900; font-size: 18px; margin-right: 12px;">@</div>
      <span style="color: #ffffff; font-size: 16px; font-weight: 700; letter-spacing: 0.02em;">NEW MENTION</span>
    </div>
    <div style="padding: 40px; line-height: 1.6;">
      <p style="font-size: 16px; color: #4b5563; margin-top: 0; margin-bottom: 24px;">
        <strong>${authorName}</strong> mentioned you in a discussion:
      </p>
      <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; padding: 24px; margin-bottom: 32px; font-style: italic; color: #1f2937;">
        "${content}"
      </div>
      <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; margin-bottom: 32px;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Topic</p>
        <p style="margin: 4px 0 0; font-size: 16px; color: #111827; font-weight: 600;">${announcementTitle}</p>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/announcements" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View Discussion
        </a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
        Official TeamHub Notification System
      </p>
    </div>
  </div>
`;

const getTaskAssignmentTemplate = (assignerName: string, taskTitle: string, priority: string, dueDate?: string) => `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; padding: 0; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
    <div style="background-color: #10b981; padding: 24px; text-align: left;">
      <span style="color: #ffffff; font-size: 16px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">New Task Assignment</span>
    </div>
    <div style="padding: 40px; line-height: 1.6;">
      <p style="font-size: 16px; color: #4b5563; margin-top: 0; margin-bottom: 24px;">
        <strong>${assignerName}</strong> has assigned a new task to you:
      </p>
      <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827;">${taskTitle}</h3>
        <div style="margin-top: 16px;">
          <span style="display: inline-block; background-color: ${priority === 'HIGH' ? '#fee2e2' : '#dcfce7'}; color: ${priority === 'HIGH' ? '#991b1b' : '#166534'}; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 12px;">
            ${priority} PRIORITY
          </span>
          ${dueDate ? `<span style="font-size: 12px; color: #6b7280; font-weight: 600;">Due: ${new Date(dueDate).toLocaleDateString()}</span>` : ''}
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/tasks" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Open Board
        </a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af; font-weight: 600;">TeamHub Task Management System</p>
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
