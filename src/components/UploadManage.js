import React, { useEffect, useRef } from 'react';
import MainDrawer from './MainDrawer';
import BackupIcon from '@material-ui/icons/Backup';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import UploadInfo from './UploadInfo';
import MultiUersAvatar from './MultiUersAvatar';
import cookies from '../cookies';
import rpcRequest from '../jsonrpc';

const pages = [
  { value: 'running', text: '上传中', Icon: BackupIcon },
  { value: 'stopped', text: '已暂停', Icon: CloudOffIcon },
  { value: 'finished', text: '已完成', Icon: CloudDoneIcon },
];

export default function UploadManage() {
  const [drives, setDrives] = React.useState([]);
  const [drive, setDrive] = React.useState(null);
  const [page, setPage] = React.useState(pages[0]);
  const didMount = useRef(true);

  const updateDrives = async () => {
    let res = await rpcRequest('Onedrive.getDrives', { require_auth: true });
    let result = res.data.result;
    console.log(result);
    setDrives(result);

    const cookieDrive = cookies.get('drive');
    if (cookieDrive && result.find((x) => x.id === cookieDrive.id)) {
      setDrive(cookieDrive);
    } else if (result.length > 0) {
      setDrive(result[0]);
      cookies.set('drive', JSON.stringify(result[0]), {
        maxAge: 3600 * 24 * 30,
      });
    }
  };

  useEffect(() => {
    updateDrives();
  }, []);

  useEffect(() => {
    if (didMount.current) {
      didMount.current = false;
      console.log('didMount');
    } else {
      cookies.set('drive', JSON.stringify(drive), {
        path: '/',
        maxAge: 3600 * 24 * 30,
      });
      console.log('didUpate');
    }
  }, [drive]);

  return (
    <MainDrawer
      title="上传管理"
      subTitle={page.text}
      pageProps={{
        page: page,
        setPage: setPage,
        pages: pages,
      }}
      endComponents={[
        <MultiUersAvatar
          key="MultiUersAvatar"
          drives={drives}
          drive={drive}
          setDrive={setDrive}
          updateDrives={updateDrives}
        />,
      ]}
    >
      <UploadInfo drive={drive} pageName={page.value}></UploadInfo>
    </MainDrawer>
  );
}
