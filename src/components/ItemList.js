import {
  Breadcrumbs,
  Button,
  IconButton,
  Link,
  makeStyles,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import apiRequest from '../api';
import DriveSelector from './DriveSelector';
import MyAppBar from './MyAppBar';
import Palette from './Palette';
import { bTokmg } from '../utils';
import { useHistory } from 'react-router-dom';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SettingsIcon from '@material-ui/icons/Settings';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ComponentShell from './ComponentShell';
import { PlayBoxOutline } from './Icons';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import SubtitlesOutlinedIcon from '@material-ui/icons/SubtitlesOutlined';
import MovieCreationOutlinedIcon from '@material-ui/icons/MovieCreationOutlined';
import MyContainer from './MyContainer';
import DialogWithFIle from './DialogWithFIle';
import TopButtons from './TopButtons';
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
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
  breadcrumbs: {
    padding: theme.spacing(2, 2, 0, 2),
  },
  breadcrumbsItem: {
    cursor: 'pointer',
  },
  breadcrumbsLink: {
    cursor: 'default',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  flex: { display: 'flex' },
  itemIcon: { marginRight: theme.spacing(1) },
  tableFoot: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '60px',
  },
}));

const removeEndSlash = (s) => {
  let r = s;
  if (r.endsWith('/')) {
    r = r.slice(0, -1);
  }
  return r;
};

const getItemIcon = (item) => {
  if (item.tmdb_movies) return MovieCreationOutlinedIcon;
  if (item.folder) return FolderOpenIcon;
  const mimeType = item.file.mimeType;
  if (mimeType.startsWith('video')) return PlayBoxOutline;
  if (mimeType.startsWith('text')) return DescriptionOutlinedIcon;
  if (
    item.name.endsWith('srt') ||
    item.name.endsWith('ssa') ||
    item.name.endsWith('ass')
  )
    return SubtitlesOutlinedIcon;
  return InsertDriveFileOutlinedIcon;
};

const ItemList = () => {
  const classes = useStyles();

  const [rowData, setRowData] = useState({
    count: 0,
    list: [],
  });

  const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const history = useHistory();

  const [state, setState] = useState(
    (() => {
      const query = new URLSearchParams(history.location.search);
      return {
        driveIds: [],
        idIndex: parseInt(query.get('drive') || 0),
        path: query.get('path') || '',
      };
    })()
  );

  const [order, setOrder] = useState({
    orderBy: 'name',
    order: 'asc',
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    fileInfo: {},
    openDialog: false,
  });

  const computeRows = useMemo(() => {
    return rowData.list.map((row) => ({
      ...row,
      name: row.name,
      pathName: row.name,
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
        if (row.tmdb_movies) return '电影';
        if (row.folder) return '文件夹';
        const idx = row.name.lastIndexOf('.');
        if (idx < 0) return '.file';
        return row.name.slice(idx + 1).toUpperCase();
      })(),
      // row.size为-1表示是文件夹
      size: row.file ? row.size : -1,
    }));
  }, [downSm, rowData]);

  const tableHeads = useMemo(
    () => [
      {
        name: 'name',
        style: { width: downSm ? '40%' : '50%' },
        text: '名称',
        sortable: true,
      },
      {
        name: 'lastModifiedDateTime',
        style: { width: '20%' },
        text: '修改日期',
        sortable: true,
      },
      {
        name: 'type',
        style: { width: downSm ? '20%' : '15%' },
        text: '类型',
      },
      {
        name: 'size',
        style: { width: downSm ? '20%' : '15%' },
        text: '大小',
      },
    ],
    [downSm]
  );

  const pathList = useMemo(() => removeEndSlash(state.path).split('/'), [
    state.path,
  ]);

  useEffect(() => {
    const unregister = history.listen((location) => {
      // path根据history变化而变化，是为了实现浏览器返回时数据也会刷新
      const query = new URLSearchParams(location.search);
      setState((prev) => ({
        ...prev,
        idIndex: parseInt(query.get('drive') || 0),
        path: query.get('path') || '',
      }));
    });
    return unregister;
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('Onedrive.getDriveIds');
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
        let res = await apiRequest('Onedrive.getItemsByPath', {
          params: {
            drive_id: state.driveIds[state.idIndex],
            path: removeEndSlash(state.path),
            order: order.order,
            order_by: order.orderBy,
          },
        });
        setRowData(res.data.result);
      };
      fetchData().catch(() => {});
    }
  }, [order, state]);

  const isBusy = useRef(false);

  const handleScrollToBottom = () => {
    if (
      state.driveIds.length > state.idIndex &&
      rowData.list.length < rowData.count &&
      !isBusy.current
    ) {
      isBusy.current = true;
      const fetchData = async () => {
        let res = await apiRequest('Onedrive.getItemsByPath', {
          params: {
            drive_id: state.driveIds[state.idIndex],
            path: removeEndSlash(state.path),
            skip: rowData.list.length,
            order: order.order,
            order_by: order.orderBy,
          },
        });
        setRowData((prev) => ({
          count: res.data.result.count,
          list: prev.list.concat(res.data.result.list),
        }));
        isBusy.current = false;
      };
      fetchData().catch(() => {
        isBusy.current = false;
      });
    }
  };

  const handleSelectDrive = (e) => {
    history.push({
      search: `?drive=${e.target.id}`,
    });
  };

  const handleAddPathChild = (pathName) => {
    history.push({
      search: `?drive=${state.idIndex}&path=${removeEndSlash(
        state.path
      )}/${pathName}`,
    });
    setDialogState((prev) => ({
      ...prev,
      openDialog: false,
    }));
  };

  const handleClickItem = (row) => {
    if (row.tmdb_movies) {
      history.push(`/movies/${row.movie_id}`);
      return;
    }

    if (row.folder) {
      handleAddPathChild(row.pathName);
    } else {
      setDialogState((prev) => ({
        ...prev,
        fileInfo: row,
        openDialog: true,
      }));
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

  const handleClickBreadcrumbsItem = (index) => {
    history.push({
      search: `?drive=${state.idIndex}&path=${pathList
        .slice(0, index + 1)
        .join('/')}`,
    });
  };

  return (
    <React.Fragment>
      <MyAppBar
        startComponents={<TopButtons />}
        endComponents={[
          <Palette key="palette" />,
          <Tooltip key="supervisor" title="后台管理">
            <IconButton
              component={styled(Link)(() => ({ color: 'inherit' }))}
              href="/admin"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>,
          <DriveSelector
            key="driveSelector"
            driveIds={state.driveIds}
            idIndex={state.idIndex}
            onClickItem={handleSelectDrive}
          />,
        ]}
      />
      <MyContainer onScrollToBottom={handleScrollToBottom}>
        <Paper className={classes.paperContent}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            className={classes.breadcrumbs}
          >
            {pathList.map((item, index) =>
              index === pathList.length - 1 ? (
                <Link
                  key={index}
                  variant="body2"
                  className={classes.breadcrumbsLink}
                >
                  {item ? item : `网盘${state.idIndex + 1}`}
                </Link>
              ) : (
                <Typography
                  key={index}
                  variant="body2"
                  className={classes.breadcrumbsItem}
                  onClick={() => handleClickBreadcrumbsItem(index)}
                >
                  {item ? item : `网盘${state.idIndex + 1}`}
                </Typography>
              )
            )}
          </Breadcrumbs>
          <TableContainer>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  {tableHeads.map((item) => (
                    <TableCell key={item.name} style={item.style}>
                      {item.sortable ? (
                        <TableSortLabel
                          active={order.orderBy === item.name}
                          direction={order.order}
                          onClick={() => handleClickSortCell(item.name)}
                        >
                          <Typography>{item.text}</Typography>
                        </TableSortLabel>
                      ) : (
                        <Typography>{item.text}</Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {computeRows.map((row, index) => (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => handleClickItem(row)}
                    className={classes.row}
                  >
                    {tableHeads
                      .map((item) => item.name)
                      .map((head) =>
                        head === 'name' ? (
                          <TableCell key={head} className={classes.flex}>
                            <ComponentShell
                              Component={getItemIcon(row)}
                              Props={{ className: classes.itemIcon }}
                            />
                            <Typography className={classes.ellipsis}>
                              {row[head]}
                            </Typography>
                          </TableCell>
                        ) : (
                          <TableCell key={head}>
                            <Typography className={classes.ellipsis}>
                              {head === 'size'
                                ? row[head] === -1
                                  ? // row.size为-1表示是文件夹
                                    `${row.folder.childCount} 项`
                                  : bTokmg(row[head])
                                : row[head]}
                            </Typography>
                          </TableCell>
                        )
                      )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rowData.list.length < rowData.count ? (
              <div style={{ display: 'flex' }}>
                <Button
                  startIcon={<RefreshIcon />}
                  style={{ flex: 1 }}
                  onClick={handleScrollToBottom}
                >
                  加载更多
                </Button>
              </div>
            ) : null}
          </TableContainer>
        </Paper>
        <DialogWithFIle
          open={dialogState.openDialog}
          onClose={() =>
            setDialogState((prev) => ({
              ...prev,
              openDialog: false,
            }))
          }
          file={dialogState.fileInfo}
        />
      </MyContainer>
    </React.Fragment>
  );
};

export default ItemList;
