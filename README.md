# parseParser
A tiny helper library for parsing SendGrid's parse webhook!

## Encoding
This library preserves the encoding for each individual part in the form data
POSTed by SendGrid to your parse service.

## How to use it
This document assumes you have setup the parse webhook as SendGrid shows you in
their documentation. Our example only covers the server implementation.

```javascript
const parse = require('parseParser');

server.post('/parse', (req, res) => {
    parse(req)
        .then(parsedData => {
            console.log(parsedData);
            res.sendStatus(200);
        })
        .catch(error => {
            console.log(error);
        });
});

```

The result from the `parse` function above will be:

```json
{
  "html": "...",
  "text": "...",
  "to": "...",
  "from": "...",
  "subject": "...",
  "headers": "..."
}
```


## Attachments
Currently, no attachments are parsed, but will be added in the near future!
