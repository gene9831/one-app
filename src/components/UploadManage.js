import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import MainDrawer from './MainDrawer';
import BackupIcon from '@material-ui/icons/Backup';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import SettingsIcon from '@material-ui/icons/Settings';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import UploadInfo from './UploadInfo';
import Palette from './Palette';
import Settings from './Settings';
import Accounts from './Accounts';
import Exit from './Exit';
import rpcRequest from '../jsonrpc';
import { AutoRotateSyncIcon } from './Icons';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import { connect } from 'react-redux';
import { OPERATING_STATUS } from '../actions';

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

let UploadManage = (props) => {
  const { authed, operationStatus } = props;
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
      endComponents={[
        <React.Fragment key="syncIcon">
          {operationStatus === OPERATING_STATUS.RUNNING ? (
            <Tooltip title="操作进行中，请勿刷新页面">
              <IconButton color="inherit">
                <Badge badgeContent={1} color="secondary">
                  <AutoRotateSyncIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          ) : null}
        </React.Fragment>,
        <Palette key="palette" />,
        <Exit key="exit" />,
      ]}
    ></MainDrawer>
  );
};

UploadManage.propTypes = {
  authed: PropTypes.bool,
  operationStatus: PropTypes.string,
};

const mapStateToProps = (state) => ({
  operationStatus: state.operationStatus,
  authed: state.auth.authed,
});

UploadManage = connect(mapStateToProps)(UploadManage);

export default UploadManage;
