import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import LinearProgress from '@material-ui/core/LinearProgress';
import rpcRequest from '../jsonrpc';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import { connect } from 'react-redux';
import { setGlobalSnackbarMessage } from '../actions';

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

let SettingItem = (props) => {
  const { config, sectionName, setFetching, setGlobalSnackbarMessage } = props;
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    setCfg(config);
  }, [config]);

  const fetchData = async (key, value) => {
    await rpcRequest('AppConfig.set', {
      params: [sectionName, key, value],
      require_auth: true,
    });
    setError('');
    setGlobalSnackbarMessage('');
    setFetching(false);
  };

  const delayFetch = (key, value) => {
    if (timer) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      fetchData(key, value).catch((e) => {
        if (e.response) {
          setError(e.response.data.error.message);
          setGlobalSnackbarMessage(e.response.data.error.message);
        } else {
          setError('网络错误');
          setGlobalSnackbarMessage('网络错误');
        }
        setFetching(false);
      });
    }, 500);
  };

  const handleChange = (e) => {
    if (cfg.type === 'int' && e.target.value.indexOf('.') >= 0) {
      // 整数不能输入小数点
      return;
    }

    let value;
    switch (cfg.type) {
      case 'int':
        value = parseInt(e.target.value);
        break;
      case 'float':
        value = parseFloat(e.target.value);
        break;
      default:
        value = e.target.value;
    }

    if (value === cfg.value) {
      return;
    }

    setCfg({ ...cfg, value: isNaN(value) ? '' : value });
    setFetching(true);

    delayFetch(e.target.id, value);
  };

  const classes = useSettingItemStyles();
  return cfg ? (
    <React.Fragment>
      <Grid item xs={6} sm={5} className={classes.alignItemsEnd}>
        <InputLabel htmlFor={cfg.id} className={classes.label}>
          {cfg.name}
        </InputLabel>
        {cfg.description.length > 0 ? (
          <Tooltip title={cfg.description}>
            <HelpIcon fontSize="small" />
          </Tooltip>
        ) : null}
      </Grid>
      <Grid item xs={6} sm={7}>
        <Input
          id={cfg.id}
          fullWidth
          value={cfg.value}
          disabled={!cfg.editable}
          color="primary"
          type={inputTypes[cfg.type]}
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
  setFetching: PropTypes.func.isRequired,
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

SettingItem = connect(null, mapDispatchToProps)(SettingItem);

const useSectionStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(3, 0),
    padding: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(2, 0),
    },
  },
  title: {
    padding: theme.spacing(1, 0),
  },
  container: {
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
  },
}));

const inputTypes = {
  int: 'number',
  float: 'number',
  str: 'text',
};

function Section(props) {
  const classes = useSectionStyles();
  const { name, title, configArray, ...others } = props;

  return (
    <Paper className={classes.root}>
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
  );
}

Section.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  configArray: PropTypes.array.isRequired,
};

const configSections = [
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
];

const useStyles = makeStyles(() => ({
  linearProgress: {
    position: 'fixed',
    width: '100%',
  },
}));

export default function Settings(props) {
  const classes = useStyles();
  const { authed } = props;
  const [cfgSections, setCfgSections] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!authed) return;
    const fetchData = async () => {
      const res = await rpcRequest('AppConfig.getAll', {
        require_auth: true,
      });
      const cfg = res.data.result;
      setCfgSections(
        configSections.map((section) => ({
          ...section,
          configs: section.ids.map((id) => ({
            ...cfg[section.name][id],
            id: id,
          })),
        }))
      );
    };
    fetchData();
  }, [authed]);

  return (
    <React.Fragment>
      <Fade in={fetching} timeout={{ exit: 1000 }}>
        <LinearProgress className={classes.linearProgress} />
      </Fade>
      <Container>
        {cfgSections.map((section) => (
          <Section
            key={section.name}
            name={section.name}
            title={section.title}
            configArray={section.configs}
            setFetching={setFetching}
          ></Section>
        ))}
      </Container>
    </React.Fragment>
  );
}

Settings.propTypes = {
  authed: PropTypes.bool,
};
