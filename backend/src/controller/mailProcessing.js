import { Response } from '../include/response.js';
import Mail from '../include/mail.js';

export async function sendEmail(req, res) {
  try {
    const emailData = req.body;
    const result = await Mail.sendEmail(emailData);
    res.send(new Response(result, true, "Email sent successfully."));
  } catch (error) {
    res.send(new Response(null, false, error.message));
  }
}