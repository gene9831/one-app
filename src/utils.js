const bTokmg = (size) => {
  let kb = size / 1024;
  if (kb < 1000) {
    return kb.toFixed(1) + ' KB';
  }
  let mb = kb / 1024;
  if (mb < 1000) {
    return mb.toFixed(1) + ' MB';
  }
  return (mb / 1024).toFixed(2) + ' GB';
};

export { bTokmg };
