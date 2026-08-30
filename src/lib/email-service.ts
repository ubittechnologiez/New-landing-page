import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const MD_EMAIL = "MD@ubittechologiez.com";
export const MD_EMAIL_ALT = "MD@ubittechnologiez.com";

export interface EnquiryEmailData {
  clientName: string;
  company: string;
  email: string;
  phone?: string;
  category: string;
  notes?: string;
  submittedAt?: string;
}

/**
 * Provisions and dispatches the enquiry email notification to Firestore 'mail_notifications' collection
 * (Triggers automated delivery to MD@ubittechologiez.com)
 */
export async function sendEnquiryEmailNotification(data: EnquiryEmailData) {
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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">New Quote Request / Business Enquiry</h2>
            <p style="color: #64748b; font-size: 14px;">A new request has been submitted on UBIT Technologiez website.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Client Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${data.clientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${data.company}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${data.email}">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${data.phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Category:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;"><span style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: 600;">${data.category}</span></td>
              </tr>
            </table>
            <div style="margin-top: 16px; padding: 14px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <strong style="color: #334155; font-size: 13px; text-transform: uppercase;">Requirements & Notes:</strong>
              <p style="color: #1e293b; margin: 8px 0 0 0; white-space: pre-wrap; font-size: 14px;">${data.notes || "No special requirements entered."}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Sent automatically from UBIT Technologiez System to MD@ubittechologiez.com</p>
          </div>
        `,
      },
      recipient: MD_EMAIL,
      recipientAlt: MD_EMAIL_ALT,
      clientData: data,
      status: "queued",
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.warn("Mail notification queue note:", error);
    return { success: false, error };
  }
}
