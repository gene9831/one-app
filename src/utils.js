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

export { bTokmg };
