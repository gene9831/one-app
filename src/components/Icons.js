import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const FileUploadOutline = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M12,12L16,16H13.5V19H10.5V16H8L12,12Z" />
    </SvgIcon>
  );
};

const FolderUploadOutline = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M20 18H4V8H20M20 6H12L10 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V8A2 2 0 0 0 20 6M16 17H14V13H11L15 9L19 13H16Z" />
    </SvgIcon>
  );
};

const Upload = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
    </SvgIcon>
  );
};

const UploadMultiple = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M9,14V8H5L12,1L19,8H15V14H9M5,18V16H19V18H5M19,20H5V22H19V20Z" />
    </SvgIcon>
  );
};

export { FileUploadOutline, FolderUploadOutline, Upload, UploadMultiple };
