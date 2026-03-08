export const validation = (schema) => {
  return (req, res, next) => {
   

    let errorResult = [];
    for (const key of Object.keys(schema)) {
      console.log(key);

      const { error } = schema[key].validate(req[key], { abortEarly: false });
      console.log(error);
      
      if (error) {
        
        error.details.forEach(
          (element) => {
          errorResult.push({
            key,
            message: element.message,
            path: element.path[0]
        });
      });
    }
    if (errorResult.length) {
      return res
        .status(400)
        .json({ message: "validation error", error: errorResult });
    }

    next();
  };
};
}
