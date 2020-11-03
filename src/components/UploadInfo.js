import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, styled } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import Checkbox from '@material-ui/core/Checkbox';
import TaskDialog from './TaskDialog';
import { Upload, UploadMultiple } from './Icons';
import ComponentShell from './ComponentShell';
import Hidden from '@material-ui/core/Hidden';
import rpcRequest from '../jsonrpc';
import SelectedToobar from './SelectedToobar';
import LinearProgressWithLabel from './LinearProgressWithLabel';
import { useMediaQuery } from '@material-ui/core';

const useRowStyles = makeStyles((theme) => ({
  filename: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  detail: {
    whiteSpace: 'normal',
    padding: theme.spacing(1),
  },
  red: {
    color: theme.palette.error.main,
  },
}));

const bTokmg = (size) => {
  let kb = size / 1024;
  if (kb < 1000) {
    return kb.toFixed(1) + 'KB';
  }
  let mb = kb / 1024;
  if (mb < 1000) {
    return mb.toFixed(1) + 'MB';
  }
  return (mb / 1024).toFixed(2) + 'GB';
};

const sTomhd = (seconds) => {
  seconds = Math.floor(seconds);
  if (seconds < 60) {
    return seconds + 's';
  }
  let mins = Math.floor(seconds / 60);
  if (mins < 60) {
    let mo = seconds % 60;
    return mins + 'm' + (mo === 0 ? '' : mo + 's');
  }
  let hours = Math.floor(mins / 60);
  if (hours < 24) {
    let mo = mins % 60;
    return hours + 'h' + (mo === 0 ? '' : mo + 'm');
  }
  return (hours / 24).toFixed(1) + 'd';
};

function Row(props) {
  const {
    row,
    openId,
    setOpenId,
    selected,
    onCheck,
    onCellTouchStart,
    onCellTouchEnd,
  } = props;
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow hover id={row.uid} selected={selected}>
        <Hidden xsDown>
          <TableCell padding="checkbox">
            <Checkbox checked={selected} onClick={onCheck} />
          </TableCell>
        </Hidden>
        <TableCell
          align="left"
          className={classes.filename}
          onTouchStart={(e) => onCellTouchStart(e, row.uid)}
          onTouchEnd={onCellTouchEnd}
        >
          {row.filename}
        </TableCell>
        <TableCell align="center">{bTokmg(row.size)}</TableCell>
        <TableCell align="center">
          {/* 进度 */}
          <LinearProgressWithLabel
            variant="determinate"
            value={(row.finished / row.size) * 100}
          />
        </TableCell>
        <TableCell align="center">
          {/* 速度 */}
          {row.status === 'running'
            ? bTokmg(row.speed) + '/s'
            : row.status === 'finished'
            ? `${bTokmg(row.finished / row.spend_time)}/s`
            : '---'}
        </TableCell>
        <TableCell
          align="center"
          className={clsx({
            [classes.red]: row.status === 'error',
          })}
        >
          {/* 剩余时间/耗时 */}
          {(() => {
            switch (row.status) {
              case 'running':
                return row.speed > 0
                  ? sTomhd((row.size - row.finished) / row.speed)
                  : '∞';
              case 'pending':
                return '正在等待';
              case 'stopping':
                return '正在停止';
              case 'stopped':
                return '已停止';
              case 'finished':
                return sTomhd(row.spend_time);
              case 'error':
                return '错误';
              default:
                return '---';
            }
          })()}
        </TableCell>
        <TableCell align="center" padding="checkbox">
          {/* 展开详情 */}
          <IconButton
            onClick={() => setOpenId(openId === row.uid ? '' : row.uid)}
          >
            {openId === row.uid ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={openId === row.uid} timeout="auto" unmountOnExit>
            <Grid container spacing={1} className={classes.detail}>
              <Grid item xs={12}>
                OneDrive帐号：{row.user.displayName}({row.user.email})
              </Grid>
              <Grid item xs={12}>
                文件路径：{row.file_path}
              </Grid>
              <Grid item xs={12}>
                OneDrive路径：{row.upload_path + row.filename}
              </Grid>
              <Grid item xs={12} sm={6}>
                文件大小：{bTokmg(row.size)}
              </Grid>
              <Grid item xs={12} sm={6}>
                已上传：{bTokmg(row.finished)}
              </Grid>
              <Grid item xs={12} sm={6}>
                创建时间：{row.created_date_time}
              </Grid>
              <Grid item xs={12} sm={6}>
                完成时间：{row.finished_date_time}
              </Grid>
              <Grid item xs={12} sm={6}>
                耗时：{sTomhd(row.spend_time)}
              </Grid>
              <Grid item xs={12} sm={6}>
                平均速度：{`${bTokmg(row.finished / row.spend_time)}/s`}
              </Grid>
              {row.status === 'error' ? (
                <Grid item xs={12}>
                  错误详情：{row.error}
                </Grid>
              ) : null}
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    finished: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    speed: PropTypes.number.isRequired,
    spend_time: PropTypes.number.isRequired,
    file_path: PropTypes.string.isRequired,
    upload_path: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    created_date_time: PropTypes.string.isRequired,
    finished_date_time: PropTypes.string.isRequired,
    error: PropTypes.string,
    user: PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  openId: PropTypes.string.isRequired,
  setOpenId: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
  onCellTouchStart: PropTypes.func,
  onCellTouchEnd: PropTypes.func,
};

Row.defaultProps = {
  onCellTouchStart: () => {},
  onCellTouchEnd: () => {},
};

const MyToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const useStyles = makeStyles((theme) => ({
  paperContent: {
    overflow: 'auto',
    position: 'relative',
  },
  table: {
    whiteSpace: 'nowrap',
    tableLayout: 'fixed',
    minWidth: '600px',
  },
  buttons: {
    '& > button': {
      marginRight: theme.spacing(2),
    },
  },
}));

const taskDialogProps = {
  file: {
    type: 'file',
    title: '上传文件',
    message: '上传文件到OneDrive，暂不包括小于5MB的文件',
  },
  folder: {
    type: 'folder',
    title: '上传文件夹',
    message:
      '上传文件夹到OneDrive。上传目录下的所有文件，不包括子目录，暂不包括小于5MB的文件',
  },
};

export default function UploadInfo(props) {
  const classes = useStyles();
  const { drives, name } = props;
  const [openId, setOpenId] = useState('');
  const [rowData, setRowData] = useState({ count: 0, data: [] });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openUpload, setOpenUpload] = useState(false);
  const [selected, setSelected] = useState([]);
  const [taskDialogProp, setTaskDialogProp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultLocalPath, setDefaultLocalPath] = useState(null);
  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));

  useEffect(() => {
    setSelected([]);
  }, [name]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await rpcRequest('Others.defaultLocalPath', {
        require_auth: true,
      });
      setDefaultLocalPath(res.data.result);
    };
    fetchData();
  }, []);

  const handleOperate = useCallback(
    (method) => {
      if (selected.length === 0) return;
      const fetchData = async () => {
        await rpcRequest('Onedrive.' + method, {
          params: { uids: selected },
          require_auth: true,
        });
        setSelected([]);
      };
      fetchData();
    },
    [selected]
  );

  const isSelected = useCallback((name) => selected.indexOf(name) !== -1, [
    selected,
  ]);

  const handleCheck = useCallback(
    (name) => {
      let newSelected = [];

      if (!isSelected(name)) {
        newSelected = selected.concat(name);
      } else {
        newSelected = selected.filter((item) => item !== name);
      }
      setSelected(newSelected);
    },
    [isSelected, selected]
  );

  const handleCheckedAll = useCallback(() => {
    if (selected.length < rowData.data.length) {
      // 全选
      setSelected(rowData.data.map((item) => item.uid));
      return;
    }
    setSelected([]);
  }, [rowData, selected]);

  const handleChangePage = useCallback((_e, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  useEffect(() => {
    let unmounted = false;
    if (drives.length > 0) {
      const fetchData = async () => {
        let res = await rpcRequest('Onedrive.uploadStatus', {
          params: {
            status: name,
            page: page,
            limit: rowsPerPage,
          },
          require_auth: true,
        });
        // Can't perform a React state update on an unmounted component.
        if (!unmounted) {
          setRowData(res.data.result);
          setLoading(false);
        }
      };
      fetchData();
      const timer = setInterval(() => {
        fetchData();
      }, 2000);
      return () => {
        unmounted = true;
        clearInterval(timer);
      };
    }
  }, [drives, name, page, rowsPerPage]);

  const handleOpenTaskDialog = useCallback((type) => {
    setTaskDialogProp(taskDialogProps[type]);
    setOpenUpload(true);
  }, []);

  const iconButtons = useMemo(() => {
    let res = [];

    if (name === 'running') {
      res.push({
        name: 'pause',
        text: '暂停',
        onClick: () => handleOperate('stopUpload'),
        Icon: PauseIcon,
      });
    } else if (name === 'stopped') {
      res.push({
        name: 'start',
        text: '继续',
        onClick: () => handleOperate('startUpload'),
        Icon: PlayArrowIcon,
      });
    }

    res.push({
      name: 'delete',
      text: '删除',
      onClick: () => handleOperate('deleteUpload'),
      Icon: DeleteIcon,
    });
    return res;
  }, [handleOperate, name]);

  const [touchStartPoint, setTouchStartPoint] = useState({ x: 0, y: 0 });
  const [touchStartUid, setTouchStartUid] = useState(null);
  const handleCellTouchStart = (e, uid) => {
    setTouchStartUid(uid);
    setTouchStartPoint({
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    });
  };
  const handleCellTouchEnd = (e) => {
    const pageX = e.changedTouches[0].pageX;
    const pageY = e.changedTouches[0].pageY;
    if (
      pageX - touchStartPoint.x >= 40 &&
      Math.abs(pageY - touchStartPoint.y) <= 30
    ) {
      if (touchStartUid === 'all') {
        handleCheckedAll();
      } else {
        handleCheck(touchStartUid);
      }
    }
  };

  return (
    <Paper className={classes.paperContent}>
      <MyToolbar>
        <div className={classes.buttons}>
          {[
            { type: 'file', text: '上传文件', Icon: Upload },
            { type: 'folder', text: '上传文件夹', Icon: UploadMultiple },
          ].map((item) => (
            <Button
              key={item.type}
              variant="contained"
              color="primary"
              startIcon={<ComponentShell Component={item.Icon} />}
              onClick={() => handleOpenTaskDialog(item.type)}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </MyToolbar>
      <SelectedToobar
        numSelected={selected.length}
        ToolbarComponent={MyToolbar}
        onCancel={() => setSelected([])}
        iconButtons={iconButtons}
      />
      {taskDialogProp ? (
        <TaskDialog
          open={openUpload}
          onClose={() => setOpenUpload(false)}
          drives={drives}
          type={taskDialogProp.type}
          title={taskDialogProp.title}
          message={taskDialogProp.message}
          defaultLocalPath={defaultLocalPath}
        ></TaskDialog>
      ) : null}
      <TableContainer style={{ overflowY: 'hidden' }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <Hidden xsDown>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < rowData.data.length
                    }
                    checked={
                      rowData.data.length > 0 &&
                      selected.length === rowData.data.length
                    }
                    onChange={handleCheckedAll}
                  ></Checkbox>
                </TableCell>
              </Hidden>
              <TableCell
                align="center"
                style={{ width: '40%' }}
                {...(downXs
                  ? {
                      onTouchStart: (e) => handleCellTouchStart(e, 'all'),
                      onTouchEnd: handleCellTouchEnd,
                    }
                  : {})}
              >
                <Typography variant="subtitle1">文件名</Typography>
              </TableCell>
              <TableCell align="center" style={{ width: '15%' }}>
                <Typography variant="subtitle1">大小</Typography>
              </TableCell>
              <TableCell align="center" style={{ width: 120 }}>
                <Typography variant="subtitle1">进度</Typography>
              </TableCell>
              <TableCell align="center" style={{ width: '15%' }}>
                <Typography variant="subtitle1">
                  {name === 'finished' ? '平均速度' : '速度'}
                </Typography>
              </TableCell>
              <TableCell align="center" style={{ width: '15%' }}>
                <Typography variant="subtitle1">
                  {name === 'finished'
                    ? '耗时'
                    : name === 'stopped'
                    ? '状态'
                    : '剩余时间'}
                </Typography>
              </TableCell>
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rowData.data.map((row) => (
              <Row
                key={row.uid}
                row={row}
                openId={openId}
                setOpenId={setOpenId}
                selected={isSelected(row.uid)}
                onCheck={() => handleCheck(row.uid)}
                {...(downXs
                  ? {
                      onCellTouchStart: handleCellTouchStart,
                      onCellTouchEnd: handleCellTouchEnd,
                    }
                  : {})}
              ></Row>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rowData.data.length === 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '60px',
          }}
        >
          {loading ? '加载中...' : '暂无数据'}
        </div>
      ) : null}
      <TablePagination
        rowsPerPageOptions={[10, 15, 20]}
        component="div"
        count={rowData.count}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        labelRowsPerPage="每页个数："
      />
    </Paper>
  );
}

UploadInfo.propTypes = {
  drives: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
};
