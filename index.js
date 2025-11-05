import express from 'express';
import { soap } from 'strong-soap';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const WSDL_URL = 'https://www1.aade.gr/tameiakes/mywebservice/RgWsPublic2/RgWsPublic2.wsdl';

app.post('/verify-afm', (req, res) => {
  const { afmCalledBy, afmCalledFor } = req.body;

  if (!afmCalledBy || !afmCalledFor) {
    return res.status(400).json({ error: 'afmCalledBy and afmCalledFor are required' });
  }

  const requestArgs = {
    RgWsPublic2InputRt_in: {
      afmCalledBy,
      afmCalledFor
    },
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
      return res.status(500).json({ error: 'SOAP client error', details: err.toString() });
    }

    client.setSecurity(new soap.BasicAuthSecurity(process.env.AADE_USERNAME, process.env.AADE_PASSWORD));

    client.rgWsPublic2AfmMethod(requestArgs, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'SOAP request failed', details: err.toString() });
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

