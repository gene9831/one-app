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

const isMobile = detectMob();

const descendingComparator = (a, b, orderBy) => {
  let aa = a[orderBy];
  let bb = b[orderBy];
  if (typeof aa === 'string') {
    aa = aa.toUpperCase();
    bb = bb.toUpperCase();
  }
  if (bb < aa) return -1;
  if (bb > aa) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export { bTokmg, random, detectMob, isMobile, getComparator, stableSort };
