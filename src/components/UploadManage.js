import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MainDrawer from './MainDrawer';
import BackupIcon from '@material-ui/icons/Backup';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import SettingsIcon from '@material-ui/icons/Settings';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import UploadInfo from './UploadInfo';
import Settings from './Settings';
import Accounts from './Accounts';
import UserAvatar from './UserAvatar';
import rpcRequest from '../jsonrpc';
import { useTheme } from '@material-ui/core';

const pageSections = [
  {
    subHeader: '上传',
    name: 'upload',
    items: [
      { name: 'running', text: '正在上传', Icon: BackupIcon },
      { name: 'stopped', text: '已暂停', Icon: CloudOffIcon },
      { name: 'finished', text: '已完成', Icon: CloudDoneIcon },
    ],
  },
  {
    subHeader: '设置',
    name: 'settings',
    items: [
      { name: 'settings', text: '应用设置', Icon: SettingsIcon },
      { name: 'accounts', text: '帐号管理', Icon: SupervisorAccountIcon },
    ],
  },
];

const settingsPages = {
  settings: Settings,
  accounts: Accounts,
};

export default function UploadManage(props) {
  const theme = useTheme();
  const { authed, setAuthed, setLogged } = props;
  const [drives, setDrives] = useState([]);
  const [pageIndex, setPageIndex] = useState({ section: 0, item: 0 });

  const updateDrives = async () => {
    let res = await rpcRequest('Onedrive.getDrives', { require_auth: true });
    let result = res.data.result;
    setDrives(result);
  };

  useEffect(() => {
    if (authed) {
      updateDrives();
    }
  }, [authed]);

  return (
    <MainDrawer
      initOpenDrawer={window.innerWidth >= theme.breakpoints.values.lg}
      pageProps={{
        pageIndex: pageIndex,
        setPageIndex: setPageIndex,
        pageSections: pageSections,
      }}
      endComponents={
        <UserAvatar
          drives={drives}
          updateDrives={updateDrives}
          setAuthed={setAuthed}
          setLogged={setLogged}
        />
      }
    >
      {(() => {
        const section = pageSections[pageIndex.section];
        const item = section.items[pageIndex.item];
        if (section.name === 'upload') {
          return <UploadInfo drives={drives} pageName={item.name} />;
        } else if (section.name === 'settings') {
          const Component = settingsPages[item.name];
          if (Component) {
            return <Component />;
          }
        }
      })()}
    </MainDrawer>
  );
}

UploadManage.propTypes = {
  authed: PropTypes.bool.isRequired,
  setAuthed: PropTypes.func.isRequired,
  setLogged: PropTypes.func.isRequired,
};
