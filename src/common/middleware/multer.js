import multer from "multer";
import fs from "node:fs";

export const multer_local = (
{custom_path = "general",
custom_fileFilter = [],}
) => {
  const full_path = `uploads/${custom_path}`;
  if (!fs.existsSync(full_path)) {
    fs.mkdirSync(full_path, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, full_path);
    },
    filename: function (req, file, cb) {
      console.log(file, "before");

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
    },
  });

  // const storage =  multer.memoryStorage()

  function fileFilter(req, file, cb) {
    if (custom_fileFilter.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(file);
      cb(new Error("invalid file type"), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};


export const multer_host = (
custom_fileFilter = []
) => {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (custom_fileFilter.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(file);
      cb(new Error("invalid file type"), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};
