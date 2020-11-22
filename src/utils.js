const bTokmg = (size) => {
  if (size < 1000) {
    return parseInt(size) + ' B';
  }
  let kb = size / 1024;
  if (kb < 1000) {
    return parseFloat(kb.toFixed(1)) + ' KB';
  }
  let mb = kb / 1024;
  if (mb < 1000) {
    return parseFloat(mb.toFixed(1)) + ' MB';
  }
  return parseFloat((mb / 1024).toFixed(2)) + ' GB';
};

const random = (n) => Math.floor(Math.random() * n);

const detectMob = () => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
};

export { bTokmg, random, detectMob };
