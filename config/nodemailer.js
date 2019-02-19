const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
  service: "Yandex",
  auth: {
    user: "andsmi97@yandex.ru",
    pass: "YbxtujJcj,tyyjuj123"
  }
});
module.exports = {
  options: transport
};
