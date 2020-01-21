const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
//registerFont(path.join(__dirname, 'public', 'app', 'fonts', '' ), {family: 'Graphik', weight: 700});

const logo_url = path.join(
  __dirname,
  "public",
  "app",
  "images",
  "1x",
  "logo.png"
);

async function createShareForm(
  title,
  text,
  img_url = path.join(__dirname, "public", "app", "images", "1x", "present.png")
) {
  const w = 820,
    h = 540;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#6e2c90";
  ctx.fillRect(0, 0, w, h);
  await drawLogo(logo_url, ctx);
  await drawPresent(img_url, ctx);
  drawTitle(title, ctx, w);
  drawText(text, w / 2, 370, 520, 30, ctx);
  return canvas;
}

function drawText(text, marginLeft, marginTop, maxWidth, lineHeight, ctx) {
  ctx.font = '1000 25px "Arial MT"';

  ctx.textBaseline = "top";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  var words = text.split(" ");
  var countWords = words.length;
  var line = "";
  for (var n = 0; n < countWords; n++) {
    var testLine = line + words[n] + " ";
    var testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth) {
      ctx.fillText(line, marginLeft, marginTop);
      line = words[n] + " ";
      marginTop += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, marginLeft, marginTop);
}

function drawTitle(title, ctx, w) {
  ctx.font = 'bold 40px "Graphik"';
  ctx.textBaseline = "top";
  ctx.fillStyle = "#17ace5";
  const titleWidth = ctx.measureText(title).width;
  const x = w / 2 - titleWidth / 2;
  const y = 123;
  ctx.fillText(title, x, y);
}

async function drawLogo(img_url = "", ctx) {
  const img = await loadImage(img_url);
  ctx.drawImage(img, 820 / 2 - 296 / 2, 30, 296, 86);
}

async function drawPresent(logo_url, ctx) {
  const img = await loadImage(logo_url);
  ctx.drawImage(img, 820 / 2 - 190 / 2, 172, 190, 200);
}

// async function print() {
//   await setLogo("logo");
//   await setPresent("01");
//   setTitle("Компас Капитана Джека Воробья");
//   const text =
//     "Шлем Железного человека? Не советую ссориться с гением, миллиардером, плейбоем и филантропом...";
//   wrapText(text, w / 2, 380, 473, 30);
//   const dataURL = canvas.toDataURL();
//   console.log(`<img src='${dataURL}' />`);
// }

module.exports = createShareForm;
