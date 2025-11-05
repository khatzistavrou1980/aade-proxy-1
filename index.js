import express from 'express';
import { soap } from 'strong-soap';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WSDL_URL = path.join(__dirname, 'RgWsPublic2.wsdl');

app.post('/verify-afm', (req, res) => {
  const { afmCalledBy, afmCalledFor } = req.body;

  if (!afmCalledBy || !afmCalledFor) {
    return res.status(400).json({ error: 'afmCalledBy and afmCalledFor are required' });
  }

  const requestArgs = {
    RgWsPublic2InputRt_in: { afmCalledBy, afmCalledFor },
    RgWsPublic2BasicRt_out: {},
    RgWsPublic2BranchRt_out: {},
    pCallSeqId_out: {},
    pErrorRec_out: {}
  };

  const options = {
    wsdl_headers: {
      Authorization: 'Basic ' + Buffer.from(`${process.env.AADE_USERNAME}:${process.env.AADE_PASSWORD}`).toString('base64')
    }
  };

  soap.createClient(WSDL_URL, options, (err, client) => {
    if (err) {
      console.error('SOAP client error:', err);
      return res.status(500).json({ error: 'SOAP client error', details: err.toString() });
    }

    client.setSecurity(new soap.BasicAuthSecurity(process.env.AADE_USERNAME, process.env.AADE_PASSWORD));

    client.rgWsPublic2AfmMethod(requestArgs, (err, result, envelope, soapHeader) => {
      if (err) {
        console.error('SOAP request failed:', err);
        console.error('Envelope received from AADE:\n', envelope);
        return res.status(500).json({ error: 'SOAP request failed', details: err.toString(), envelope });
      }

      const response = result?.RgWsPublic2Rt_out || {};
      const errorMsg = result?.pErrorRec_out?.errorDescr;

      if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
      }

      res.json({ response });
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AADE proxy listening on port ${port}`));
