import express, { Request } from 'express';
import { requestDto } from './request.dto';
import { config } from 'dotenv';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { z } from 'zod';

config();

let app = express();
app.use(express.json());


const apiKey = process.env.API_KEY || ""
const origin = new Sender("MS_gw62wt@trial-3z0vklod63xg7qrx.mlsender.net");
const mailersend = new MailerSend({
    apiKey
});


app.post('/mail-send', async (req: Request, res: any) => {
    try {
        requestDto.parse(req.body);
        type req_type = z.infer<typeof requestDto>;
        const data: req_type = req.body;

        const emailParams = new EmailParams()
        .setFrom(origin)
        .setTo([new Recipient(data.to)]) 
        .setSubject("Video transcription")
        .setText(data.msg);

        await mailersend.email.send(emailParams);
        res.send({
            status: "ok"
        })
    }
    catch(e) {
        res.send({
            status: "error",
            msg: e
        })
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Served on: 0.0.0.0:"+PORT);
})