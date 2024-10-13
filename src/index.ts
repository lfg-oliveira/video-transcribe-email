import express, { Request } from 'express';
import { requestDto } from './request.dto';
import { config } from 'dotenv';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { z } from 'zod';
import { HttpStatusCode } from 'axios';
import  swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
config();

let app = express();
app.use(express.json());


const apiKey = process.env.API_KEY || ""
const origin = new Sender("video_transcribe@guidorizzi.com");
const mailersend = new MailerSend({
    apiKey
});

/**
 * @openapi
 * /api/mail-send:
 *  post:
 *      description: Responsável por enviar o email ao recipiente
 *      requestBody:
 *          content:
 *              application.json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          to:
 *                              type: string
 *                          msg:
 *                              type: string
 *                      example:
 *                          to: example@email.com
 *                          msg: "Olá, mundo"                      
 *      responses:
 *          200:
 *              description: A mensagem foi enviada
 *          400:
 *              decription: Houve um erro no envio dos dados
 */
app.post('/api/mail-send', async (req: Request, res: express.Response) => {
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
        res.status(HttpStatusCode.BadRequest).send({
            status: "error",
            msg: e
        })
    }
})

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Video transcribe',
        version: '1.0.0',
      },
    },
    apis: ['./src/*.ts'], // files containing annotations as above
};

const openapiSpec = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(openapiSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Served on: 0.0.0.0:"+PORT);
})
