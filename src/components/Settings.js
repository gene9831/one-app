import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import apiRequest from '../api';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Paper from '@material-ui/core/Paper';
import { connect } from 'react-redux';
import {
  setGlobalSnackbarMessage,
  setOperationStatus,
  OPERATING_STATUS,
  AUTH_STATUS,
} from '../actions';

const useSettingItemStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  alignItemsEnd: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  label: {
    marginRight: theme.spacing(1),
  },
  success: {
    color: theme.palette.success.main,
  },
}));

const inputTypes = {
  int: 'number',
  float: 'number',
  str: 'text',
};

let SettingItem = (props) => {
  const {
    config: configProp,
    sectionName,
    setGlobalSnackbarMessage,
    setOperationStatus,
  } = props;
  // TODO 考虑下状态提升怎么弄
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    setConfig(configProp);
  }, [configProp]);

  const fetchData = async (key, value) => {
    await apiRequest('AppConfig.set', {
      params: [sectionName, key, value],
      require_auth: true,
    });
    setError('');
    setOperationStatus(OPERATING_STATUS.SUCCESS);
  };

  const delayFetch = (key, value) => {
    if (timer) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      fetchData(key, value).catch((e) => {
        setOperationStatus(OPERATING_STATUS.FAILED);
        if (e.response) {
          setError(e.response.data.error.message);
          setGlobalSnackbarMessage(e.response.data.error.message);
        } else {
          setError('网络错误');
          setGlobalSnackbarMessage('网络错误');
        }
      });
    }, 500);
  };

  const handleChange = (e) => {
    if (config.type === 'int' && e.target.value.indexOf('.') >= 0) {
      // 整数不能输入小数点
      return;
    }

    let value;
    switch (config.type) {
      case 'int':
        value = parseInt(e.target.value);
        value = isNaN(value) ? '' : value;
        break;
      case 'float':
        value = parseFloat(e.target.value);
        value = isNaN(value) ? '' : value;
        break;
      default:
        value = e.target.value;
    }
    if (value === config.value) {
      return;
    }

    setConfig({ ...config, value });
    setOperationStatus(OPERATING_STATUS.RUNNING);
    setGlobalSnackbarMessage('');

    delayFetch(e.target.id, value);
  };

  const classes = useSettingItemStyles();
  return config ? (
    <React.Fragment>
      <Grid item xs={6} className={classes.alignItemsEnd}>
        <InputLabel htmlFor={config.id} className={classes.label}>
          {config.name}
        </InputLabel>
        {config.description.length > 0 ? (
          <Tooltip title={config.description} placement="top">
            <HelpIcon fontSize="small" color="action" />
          </Tooltip>
        ) : null}
      </Grid>
      <Grid item xs={6}>
        <Input
          id={config.id}
          fullWidth
          value={config.value}
          disabled={!config.editable}
          color="primary"
          type={inputTypes[config.type]}
          onChange={handleChange}
          error={error.length > 0}
        ></Input>
      </Grid>
    </React.Fragment>
  ) : null;
};

SettingItem.propTypes = {
  config: PropTypes.object.isRequired,
  sectionName: PropTypes.string.isRequired,
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
  setOperationStatus: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  operationStatus: state.operationStatus,
  authed: state.auth.status === AUTH_STATUS.PASS,
});

const mapDispatchToProps = (dispatch) => ({
  setGlobalSnackbarMessage: (message) =>
    dispatch(setGlobalSnackbarMessage(message)),
  setOperationStatus: (status) => dispatch(setOperationStatus(status)),
});

SettingItem = connect(mapStateToProps, mapDispatchToProps)(SettingItem);

const useSectionStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),
  },
  title: {
    padding: theme.spacing(1, 0),
  },
  container: {
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
  },
}));

function Section(props) {
  const classes = useSectionStyles();
  const { name, title, configArray, ...others } = props;

  return (
    <Grid item xs={12} md={6}>
      <Paper className={classes.content}>
        <Typography
          variant="h5"
          component="div"
          color="primary"
          className={classes.title}
        >
          {title}
        </Typography>
        <Grid container spacing={2} className={classes.container}>
          {configArray.map((item) => (
            <SettingItem
              key={item.id}
              sectionName={name}
              config={item}
              {...others}
            />
          ))}
        </Grid>
      </Paper>
    </Grid>
  );
}

Section.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  configArray: PropTypes.array.isRequired,
};

const showSections = [
  {
    name: 'onedrive',
    title: '网盘',
    ids: ['upload_chunk_size', 'upload_threads_num'],
  },
  {
    name: 'admin',
    title: '登录',
    ids: ['auth_password', 'auth_token_max_age'],
  },
  {
    name: 'others',
    title: '其他',
    ids: ['default_local_path'],
  },
];

let Settings = (props) => {
  const { authed, setGlobalSnackbarMessage } = props;
  const [sections, setSections] = useState([]);
  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));
  const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!authed) return;
    const fetchData = async () => {
      const res = await apiRequest('AppConfig.getAll', {
        require_auth: true,
      });
      const cfg = res.data.result;
      setSections(
        showSections.map((section) => ({
          ...section,
          configs: section.ids.map((id) => ({
            ...cfg[section.name][id],
            id: id,
          })),
        }))
      );
    };
    fetchData().catch((e) => {
      if (!e.response) {
        setGlobalSnackbarMessage('网络错误');
      }
    });
  }, [authed, setGlobalSnackbarMessage]);

  return (
    <Grid container spacing={downXs ? 1 : downSm ? 2 : 3}>
      {sections.map((section) => (
        <Section
          key={section.name}
          name={section.name}
          title={section.title}
          configArray={section.configs}
        ></Section>
      ))}
    </Grid>
  );
};

Settings.propTypes = {
  authed: PropTypes.bool,
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
};

Settings = connect(mapStateToProps, mapDispatchToProps)(Settings);
export default Settings;
