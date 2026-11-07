import { Merchant, HelpPost } from '../types';

export interface EmailLogItem {
  id: string;
  type: 'MERCHANT_APPLICATION' | 'CHAMBER_OPPORTUNITY' | 'CUSTOM_BROADCAST';
  title: string;
  subject: string;
  recipients: string[];
  recipientCount: number;
  contentSnippet: string;
  htmlContent: string;
  sentAt: string;
  status: 'SENT_VIA_SMTP' | 'LOGGED_AND_QUEUED' | 'FAILED';
  deliveryNote: string;
}

export interface NotificationConfigResponse {
  adminEmails: string[];
  isSmtpConfigured: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  hasSmtpPass?: boolean;
  smtpFrom?: string;
}

export interface SmtpConfigPayload {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass?: string;
  smtpFrom: string;
}

// 1. Notify Admins on New Merchant Application
export async function sendMerchantApplicationNotification(merchant: Merchant): Promise<{
  success: boolean;
  recipients?: string[];
  subject?: string;
  deliveryStatus?: string;
  deliveryNote?: string;
  mailtoUrl?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/notifications/merchant-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to trigger merchant application notification:', err);
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

// 2. Broadcast New Help Post / Opportunity to All Chamber Merchants
export async function sendChamberOpportunityNotification(
  post: HelpPost,
  merchantEmails: string[]
): Promise<{
  success: boolean;
  recipientCount?: number;
  recipients?: string[];
  subject?: string;
  deliveryStatus?: string;
  deliveryNote?: string;
  mailtoUrl?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/notifications/chamber-opportunity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post, merchantEmails }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to trigger opportunity broadcast notification:', err);
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

// 3. Fetch Admin Notification Configuration
export async function fetchNotificationConfig(): Promise<NotificationConfigResponse> {
  try {
    const res = await fetch('/api/notifications/config');
    return await res.json();
  } catch (err) {
    return {
      adminEmails: ['baizw2000@gmail.com'],
      isSmtpConfigured: false,
      smtpFrom: 'WEBA 滑铁卢名商会秘书处 <weba.chamber@gmail.com>',
    };
  }
}

// 4. Update Admin Email Recipients
export async function updateAdminEmails(adminEmails: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmails }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('Failed to update admin emails:', err);
    return false;
  }
}

// 5. Fetch Outbox History Logs
export async function fetchNotificationLogs(): Promise<EmailLogItem[]> {
  try {
    const res = await fetch('/api/notifications/logs');
    const data = await res.json();
    return data.logs || [];
  } catch (err) {
    return [];
  }
}

// 6. Save SMTP Configuration directly to Firestore & Server
export async function saveSmtpConfig(config: SmtpConfigPayload): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  config?: any;
}> {
  try {
    const res = await fetch('/api/notifications/smtp-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to save SMTP config to Firestore:', err);
    return { success: false, error: err?.message || '网络通信异常' };
  }
}

// 7. One-Click Test Send Verification Email
export async function testSmtpConnection(targetEmail?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  recipient?: string;
  messageId?: string;
}> {
  try {
    const res = await fetch('/api/notifications/test-smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEmail }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to trigger SMTP test email:', err);
    return { success: false, error: err?.message || '网络连接超时或服务器异常' };
  }
}

