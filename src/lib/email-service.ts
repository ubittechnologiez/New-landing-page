import emailjs from "@emailjs/browser";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const MD_EMAIL = "MD@ubittechologiez.com";
export const MD_EMAIL_ALT = "ubittechnologiez@gmail.com";

export interface EnquiryEmailData {
  clientName: string;
  company: string;
  email: string;
  phone?: string;
  category: string;
  notes?: string;
  submittedAt?: string;
}

// Local storage key for dynamic admin configuration if needed
const EMAILJS_CONFIG_KEY = "ubit_emailjs_config";

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export function getEmailJSConfig(): EmailJSConfig {
  const envServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
  const envTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
  const envPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

  if (envServiceId && envTemplateId && envPublicKey) {
    return {
      serviceId: envServiceId,
      templateId: envTemplateId,
      publicKey: envPublicKey,
    };
  }

  try {
    const stored = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        serviceId: parsed.serviceId || envServiceId,
        templateId: parsed.templateId || envTemplateId,
        publicKey: parsed.publicKey || envPublicKey,
      };
    }
  } catch (err) {
    console.warn("Failed to read emailjs config from localStorage", err);
  }

  return {
    serviceId: envServiceId,
    templateId: envTemplateId,
    publicKey: envPublicKey,
  };
}

export function saveEmailJSConfig(config: Partial<EmailJSConfig>) {
  try {
    const current = getEmailJSConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Sends quotation / enquiry email via EmailJS browser SDK and logs the event in Firestore
 */
export async function sendEnquiryEmailNotification(data: EnquiryEmailData) {
  const timestamp = data.submittedAt || new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const config = getEmailJSConfig();

  let emailjsResult: { success: boolean; error?: string } = { success: false };

  if (config.serviceId && config.templateId && config.publicKey) {
    try {
      const templateParams = {
        to_email: MD_EMAIL_ALT,
        recipient: MD_EMAIL_ALT,
        client_name: data.clientName,
        from_name: data.clientName,
        company: data.company,
        email: data.email,
        phone: data.phone || "Not provided",
        category: data.category,
        notes: data.notes || "No additional requirements specified.",
        submitted_at: timestamp,
        reply_to: data.email,
      };

      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );

      emailjsResult = { success: true };
    } catch (err: any) {
      console.error("EmailJS dispatch error:", err);
      emailjsResult = {
        success: false,
        error: err?.text || err?.message || "Failed to dispatch via EmailJS",
      };
    }
  } else {
    emailjsResult = {
      success: false,
      error: "EmailJS credentials not fully configured.",
    };
  }

  // Backup log in Firestore mail_notifications collection
  try {
    const mailCollection = collection(db, "mail_notifications");
    await addDoc(mailCollection, {
      to: [MD_EMAIL, MD_EMAIL_ALT],
      message: {
        subject: `[New IT Enquiry] ${data.company} - ${data.clientName} (${data.category})`,
        text: `New Enquiry from ${data.clientName} (${data.company}):
Category: ${data.category}
Email: ${data.email}
Phone: ${data.phone || "N/A"}
Notes: ${data.notes || "N/A"}`,
      },
      clientData: data,
      emailjsStatus: emailjsResult.success ? "sent" : "failed_or_unconfigured",
      emailjsError: emailjsResult.error || null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Mail notification queue note:", error);
  }

  return emailjsResult;
}
