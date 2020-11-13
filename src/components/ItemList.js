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
  TableSortLabel,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
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
  ellipsis: {
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

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
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
  const [order, setOrder] = useState({
    orderBy: 'name',
    order: 'asc',
  });

  const computeRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      name: row.name,
      lastModifiedDateTime: new Date(row.lastModifiedDateTime).toLocaleString(
        [],
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: downSm ? undefined : '2-digit',
          minute: downSm ? undefined : '2-digit',
          hour12: false,
        }
      ),
      type: (() => {
        if (row.folder) return '文件夹';
        const idx = row.name.lastIndexOf('.');
        if (idx < 0) return '.file';
        return row.name.slice(idx + 1).toUpperCase();
      })(),
      size: row.file ? row.size : 0,
    }));
  }, [downSm, rows]);

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

  const handleClickSortCell = (name) => {
    let newOrder;
    if (order.orderBy === name) {
      newOrder = {
        ...order,
        order: order.order === 'asc' ? 'desc' : 'asc',
      };
    } else {
      newOrder = {
        ...order,
        orderBy: name,
      };
    }
    setOrder(newOrder);
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
                    {[
                      {
                        name: 'name',
                        style: { width: downSm ? '35%' : '50%' },
                        text: '名称',
                      },
                      {
                        name: 'lastModifiedDateTime',
                        style: { width: '20%' },
                        text: '修改日期',
                      },
                      {
                        name: 'type',
                        style: { width: downSm ? '30' : '20%' },
                        text: '类型',
                      },
                      {
                        name: 'size',
                        style: { width: downSm ? '15%' : '10%' },
                        text: '大小',
                      },
                    ].map((item) => (
                      <TableCell key={item.name} style={item.style}>
                        <TableSortLabel
                          active={order.orderBy === item.name}
                          direction={order.order}
                          onClick={() => handleClickSortCell(item.name)}
                        >
                          <Typography>{item.text}</Typography>
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stableSort(
                    computeRows,
                    getComparator(order.order, order.orderBy)
                  ).map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleClickItem(row)}
                      className={classes.row}
                    >
                      {['name', 'lastModifiedDateTime', 'type', 'size'].map(
                        (item) => (
                          <TableCell
                            key={item}
                            align={item === 'size' ? 'right' : 'left'}
                          >
                            <Typography className={classes.ellipsis}>
                              {item === 'size'
                                ? row[item] === 0
                                  ? ''
                                  : bTokmg(row[item])
                                : row[item]}
                            </Typography>
                          </TableCell>
                        )
                      )}
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
