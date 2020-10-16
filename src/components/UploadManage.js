import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import MainDrawer from './MainDrawer';
import BackupIcon from '@material-ui/icons/Backup';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import UploadInfo from './UploadInfo';
import MultiUersAvatar from './MultiUersAvatar';
import cookies from '../cookies';
import rpcRequest from '../jsonrpc';
import { useTheme } from '@material-ui/core';

const pages = [
  { value: 'running', text: '上传中', Icon: BackupIcon },
  { value: 'stopped', text: '已暂停', Icon: CloudOffIcon },
  { value: 'finished', text: '已完成', Icon: CloudDoneIcon },
];

export default function UploadManage(props) {
  const { authed } = props;
  const [drives, setDrives] = React.useState([]);
  const [drive, setDrive] = React.useState(null);
  const [page, setPage] = React.useState(pages[0]);
  const theme = useTheme();

  const updateDrives = async () => {
    let res = await rpcRequest('Onedrive.getDrives', { require_auth: true });
    let result = res.data.result;
    setDrives(result);

    const cookieDrive = cookies.get('drive');
    if (cookieDrive && result.find((x) => x.id === cookieDrive.id)) {
      setDrive(cookieDrive);
    } else if (result.length > 0) {
      setDrive(result[0]);
    }
  };

  useEffect(() => {
    if (authed) {
      updateDrives();
    }
  }, [authed]);

  useEffect(() => {
    if (drive) {
      // 当drive不为null，更新cookie。刷新页面cookie maxAge也会更新
      cookies.set('drive', JSON.stringify(drive), { maxAge: 3600 * 24 * 30 });
    }
  }, [drive]);

  return (
    <MainDrawer
      title="上传管理"
      subTitle={page.text}
      initOpenDrawer={window.innerWidth >= theme.breakpoints.values.lg}
      pageProps={{
        page: page,
        setPage: setPage,
        pages: pages,
      }}
      endComponents={
        <MultiUersAvatar
          key="MultiUersAvatar"
          drives={drives}
          drive={drive}
          setDrive={setDrive}
          updateDrives={updateDrives}
        />
      }
    >
      <UploadInfo drive={drive} pageName={page.value}></UploadInfo>
    </MainDrawer>
  );
}

UploadManage.propTypes = {
  authed: PropTypes.bool.isRequired,
};
