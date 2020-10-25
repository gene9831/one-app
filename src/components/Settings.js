import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import CircularProgress from '@material-ui/core/CircularProgress';
import rpcRequest from '../jsonrpc';

const useSettingItemStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  item: {
    margin: theme.spacing(1, 0),
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

function SettingItem(props) {
  const { config, sectionName } = props;
  const [cfg, setCfg] = useState(null);
  const [fetching, setFetching] = useState(false);
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
    setFetching(false);
  };

  const delayFetch = (key, value) => {
    if (timer) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      fetchData(key, value).catch((e) => {
        setError(e.response.data.error.message);
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
      <Grid item xs={4} className={clsx(classes.item, classes.alignItemsEnd)}>
        <InputLabel htmlFor={cfg.id} className={classes.label}>
          {cfg.name}
        </InputLabel>
        {cfg.description.length > 0 ? (
          <Tooltip title={cfg.description}>
            <HelpIcon fontSize="small" />
          </Tooltip>
        ) : null}
      </Grid>
      <Grid item xs={7} className={classes.item}>
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
      <Grid item xs={1} className={clsx(classes.item, classes.alignItemsEnd)}>
        {fetching ? <CircularProgress size={'2rem'} /> : null}
      </Grid>
    </React.Fragment>
  ) : null;
}

SettingItem.propTypes = {
  config: PropTypes.object.isRequired,
  sectionName: PropTypes.string.isRequired,
};

const useSectionStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 0),
  },
}));

const inputTypes = {
  int: 'number',
  float: 'number',
  str: 'text',
};

function Section(props) {
  const classes = useSectionStyles();
  const { name, title, configArray } = props;

  return (
    <Grid container className={classes.root}>
      <Typography variant="h5" component="h1" color="primary">
        {title}
      </Typography>
      <Grid container spacing={2}>
        {configArray.map((item) => (
          <SettingItem key={item.id} sectionName={name} config={item} />
        ))}
      </Grid>
    </Grid>
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

export default function Settings() {
  const [cfgSections, setCfgSections] = useState([]);

  useEffect(() => {
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
  }, []);

  return cfgSections.map((section) => (
    <Section
      key={section.name}
      name={section.name}
      title={section.title}
      configArray={section.configs}
    ></Section>
  ));
}
