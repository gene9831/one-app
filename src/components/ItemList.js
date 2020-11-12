import {
  Container,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import rpcRequest from '../jsonrpc';
import DriveSelector from './DriveSelector';
import MyAppBar from './MyAppBar';
import Palette from './Palette';
import { bTokmg } from '../utils';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  container: {
    flexGrow: 1,
    overflow: 'auto',
  },
  toolbar: {
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
    },
  },
  table: {
    whiteSpace: 'nowrap',
    tableLayout: 'fixed',
    minWidth: '600px',
  },
  row: {
    cursor: 'default',
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const removeEndSlash = (s) => {
  let r = s;
  if (r.endsWith('/')) {
    r = r.slice(0, -1);
  }
  return r;
};

const ItemList = () => {
  const classes = useStyles();

  const [rows, setRows] = useState([]);

  const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const history = useHistory();

  const [state, setState] = useState({
    driveIds: [],
    idIndex: 0,
    path: new URLSearchParams(history.location.search).get('path') || '',
  });

  useEffect(() => {
    history.listen((location) => {
      setState((prev) => ({
        ...prev,
        path: new URLSearchParams(location.search).get('path') || '',
      }));
    });
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await rpcRequest('Onedrive.getDriveIds');
      setState((prev) => ({
        ...prev,
        driveIds: res.data.result,
      }));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (state.driveIds.length > state.idIndex) {
      const fetchData = async () => {
        let res = await rpcRequest('Onedrive.getItemsByPath', {
          params: {
            drive_id: state.driveIds[state.idIndex],
            path: removeEndSlash(state.path),
            limit: 0,
          },
        });
        setRows(res.data.result);
      };
      fetchData();
    }
  }, [state]);

  const handleSelectDrive = (e) => {
    setState((prev) => ({
      ...prev,
      path: '',
      idIndex: parseInt(e.target.id),
    }));
    history.push({
      search: '',
    });
  };

  const handleClickItem = (row) => {
    if (row.folder) {
      history.push({
        search: `?path=${removeEndSlash(state.path)}/${row.name}`,
      });
    }
  };

  return (
    <div className={classes.root}>
      <MyAppBar
        title="文件列表"
        endComponents={[
          <Palette key="palette" />,
          <DriveSelector
            key="driveSelector"
            driveIds={state.driveIds}
            idIndex={state.idIndex}
            onClickItem={handleSelectDrive}
          />,
        ]}
      />
      <div className={classes.container}>
        <div className={classes.toolbar}></div>
        <Container className={classes.content}>
          <Paper className={classes.paperContent}>
            <TableContainer>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: downSm ? '35%' : '50%' }}>
                      <Typography variant="subtitle1">名称</Typography>
                    </TableCell>
                    <TableCell style={{ width: '20%' }}>
                      <Typography variant="subtitle1">修改日期</Typography>
                    </TableCell>
                    <TableCell style={{ width: downSm ? '30' : '20%' }}>
                      <Typography variant="subtitle1">类型</Typography>
                    </TableCell>
                    <TableCell style={{ width: downSm ? '15%' : '10%' }}>
                      <Typography variant="subtitle1">大小</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleClickItem(row)}
                      className={classes.row}
                    >
                      {/* 名称 */}
                      <TableCell className={classes.name}>{row.name}</TableCell>
                      <TableCell>
                        {/* 修改日期 */}
                        {new Date(row.lastModifiedDateTime).toLocaleString([], {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: downSm ? undefined : '2-digit',
                          minute: downSm ? undefined : '2-digit',
                          hour12: false,
                        })}
                      </TableCell>
                      {/* 类型 */}
                      <TableCell>
                        {(() => {
                          if (row.folder) return '文件夹';
                          const idx = row.name.lastIndexOf('.');
                          if (idx < 0) return '.file';
                          return row.name.slice(idx + 1).toUpperCase();
                        })()}
                      </TableCell>
                      {/* 大小 */}
                      <TableCell align="right">
                        {row.file ? bTokmg(row.size) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default ItemList;
