import nodemailer from "nodemailer";


export async function sendEmail({
    from = process.env.APP_EMAIL,
    to = "",
    cc = "",
    bcc = "",
    subject = "Anwer",
    text = "",
    html = "",
    attachments = []
} = {}) {

    // Create a test account or replace with real credentials.
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });

    // Wrap in an async IIFE so we can use await.

    const info = await transporter.sendMail({
        from: `"Anwer❤️" <${from}>`,
        to,
        cc,
        bcc,
        subject,
        text,
        attachments,
        html
    });

    console.log("Message sent:", info.messageId);
}




