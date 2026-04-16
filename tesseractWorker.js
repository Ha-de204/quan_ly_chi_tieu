const { createWorker } = require('tesseract.js');

let worker;

const initWorker = async () => {
  worker = await createWorker('vie+eng');

  await worker.setParameters({
    tessedit_pageseg_mode: 6,
    tessedit_char_whitelist:
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơ.,:/- ',
  });

  console.log('✅ OCR Worker ready');
};

const getWorker = () => worker;

module.exports = { initWorker, getWorker };