import EventEmitter from 'node:events'
import { sendEmail } from '../Email/send.email.js'
import { emailTemplate } from '../Email/email.templet.js'
export const emailEvent = new EventEmitter()

emailEvent.on("sendConfirmEmail", async (data) => {
    const result = await sendEmail(data).catch(err=>{
        console.log(`Email failed ${err}`);
        
    })
}) 
emailEvent.on("forgotPassword", async (data) => {
    const result = await sendEmail(data).catch(err=>{
        console.log(`Email failed ${err}`);
        
    })
}) 
