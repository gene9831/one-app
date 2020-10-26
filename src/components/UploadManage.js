import React, { useEffect, useState, useMemo } from 'react';
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
import Exit from './Exit';
import rpcRequest from '../jsonrpc';

const pageSections = [
  {
    name: 'upload',
    subHeader: '上传',
    items: [
      { name: 'running', text: '正在上传', Icon: BackupIcon },
      { name: 'stopped', text: '已停止', Icon: CloudOffIcon },
      { name: 'finished', text: '已完成', Icon: CloudDoneIcon },
    ],
  },
  {
    name: 'settings',
    subHeader: '设置',
    items: [
      { name: 'settings', text: '应用设置', Icon: SettingsIcon },
      { name: 'accounts', text: '帐号管理', Icon: SupervisorAccountIcon },
    ],
  },
];

export default function UploadManage(props) {
  const { authed, setAuthed, setLogged } = props;
  const [drives, setDrives] = useState([]);

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

  const pageViews = useMemo(
    () => [
      {
        name: 'upload',
        Component: UploadInfo,
        props: { drives: drives },
      },
      {
        name: 'settings',
        items: [
          {
            name: 'settings',
            Component: Settings,
            props: { authed: authed },
          },
          {
            name: 'accounts',
            Component: Accounts,
            props: { drives: drives, updateDrives: updateDrives },
          },
        ],
      },
    ],
    [authed, drives]
  );

  return (
    <MainDrawer
      pageProps={{
        sections: pageSections,
        views: pageViews,
        // defaultIndex: { section: 0, item: 0 },
      }}
      endComponents={<Exit setAuthed={setAuthed} setLogged={setLogged} />}
    ></MainDrawer>
  );
}

UploadManage.propTypes = {
  authed: PropTypes.bool.isRequired,
  setAuthed: PropTypes.func.isRequired,
  setLogged: PropTypes.func.isRequired,
};
