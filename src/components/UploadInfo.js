import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import { Button, Typography } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Checkbox from '@material-ui/core/Checkbox';
import TaskDialog from './TaskDialog';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import rpcRequest from '../jsonrpc';

const useRowStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      borderBottom: 'unset',
      position: 'relative',
      zIndex: 1,
    },
    '& >*:first-child': {
      width: '1rem',
      paddingRight: 'unset',
    },
  },
  detail: {
    '& > tr > td': {
      borderBottom: 'unset',
    },
  },
  green: {
    color: theme.palette.success.main,
  },
  red: {
    color: theme.palette.error.main,
  },
}));

function Row(props) {
  const { row, openId, setOpenId, selected, setSelected } = props;
  const classes = useRowStyles();

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

  const handleOnSelected = (e) => {
    let checked = e.target.checked;
    if (checked) {
      if (selected.indexOf(row.uid) === -1) {
        setSelected(selected.concat(row.uid));
      }
    } else {
      setSelected(selected.filter((uid) => uid !== row.uid));
    }
  };

  return (
    <React.Fragment>
      <TableRow className={classes.root} hover id={row.uid}>
        <TableCell>
          <Checkbox
            color="primary"
            onChange={handleOnSelected}
            checked={selected.indexOf(row.uid) !== -1}
          />
        </TableCell>
        <TableCell align="left">{row.filename}</TableCell>
        <TableCell align="center">{bTokmg(row.size)}</TableCell>
        <TableCell align="center">
          {/* 进度 */}
          <CircularProgressWithLabel value={(row.finished / row.size) * 100} />
        </TableCell>
        <TableCell align="center">
          {/* 速度 */}
          {row.status === 'running' ? bTokmg(row.speed) + '/s' : '---'}
        </TableCell>
        <TableCell
          align="center"
          className={clsx({
            [classes.green]: row.status === 'finished',
            [classes.red]: row.status === 'error',
          })}
        >
          {/* 剩余时间 */}
          {(() => {
            switch (row.status) {
              case 'running':
                return sTomhd((row.size - row.finished) / row.speed);
              case 'pending':
                return '正在等待';
              case 'stopping':
                return '正在停止';
              case 'stopped':
                return '已暂停';
              case 'finished':
                return '已完成';
              case 'error':
                return '错误';
              default:
                return '---';
            }
          })()}
        </TableCell>
        <TableCell align="center">
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
            <Box padding={1}>
              <Table size="small">
                <TableBody className={classes.detail}>
                  <TableRow>
                    <TableCell>
                      OneDrive帐号：{row.user.displayName}({row.user.email})
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>文件路径：{row.file_path}</TableCell>
                    <TableCell>上传路径：{row.upload_path}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>文件大小：{bTokmg(row.size)}</TableCell>
                    <TableCell>已上传：{bTokmg(row.finished)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>创建时间：{row.created_date_time}</TableCell>
                    <TableCell>完成时间：{row.finished_date_time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>耗时：{sTomhd(row.spend_time)}</TableCell>
                    <TableCell>
                      平均速度：{bTokmg(row.finished / row.spend_time)}/s
                    </TableCell>
                  </TableRow>
                  {row.status === 'error' ? (
                    <TableRow>
                      <TableCell className={classes.red}>
                        错误详情：{row.error}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Box>
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
  selected: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
};

const useStyles = makeStyles((theme) => ({
  buttons: {
    '& > button': {
      margin: theme.spacing(0, 0, 1, 1),
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

const pageButtons = {
  stopped: { text: '继续', method: 'startUpload', Icon: PlayCircleOutlineIcon },
  running: { text: '暂停', method: 'stopUpload', Icon: PauseCircleOutlineIcon },
};

export default function UploadInfo(props) {
  const classes = useStyles();
  const { drives, pageName } = props;
  const [openId, setOpenId] = useState('');
  const [rowData, setRowData] = useState({ count: 0, data: [] });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openUpload, setOpenUpload] = useState(false);
  const [selected, setSelected] = useState([]);
  const [taskDialogProp, setTaskDialogProp] = useState(null);

  const handleOperate = (method) => {
    if (selected.length === 0) return;
    const fetchData = async () => {
      await rpcRequest('Onedrive.' + method, {
        params: { uids: selected },
        require_auth: true,
      });
      setSelected([]);
    };
    fetchData();
  };

  const handleClikCheckedAll = (e) => {
    if (e.target.checked) {
      // 全选
      setSelected(rowData.data.map((item) => item.uid));
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (_e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    let unmounted = false;
    const fetchData = async () => {
      let res = await rpcRequest('Onedrive.uploadStatus', {
        params: {
          status: pageName,
          page: page,
          limit: rowsPerPage,
        },
        require_auth: true,
      });
      // Can't perform a React state update on an unmounted component.
      if (!unmounted) {
        setRowData(res.data.result);
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
  }, [pageName, page, rowsPerPage]);

  const handleOpenTaskDialog = (type) => {
    setTaskDialogProp(taskDialogProps[type]);
    setOpenUpload(true);
  };

  return (
    <div>
      <div className={classes.buttons}>
        {[
          { type: 'file', text: '上传文件' },
          { type: 'folder', text: '上传文件夹' },
        ].map((item) => (
          <Button
            key={item.type}
            variant="outlined"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleOpenTaskDialog(item.type)}
          >
            {item.text}
          </Button>
        ))}
        {(() => {
          if (pageName === 'stopped' || pageName === 'running') {
            const pageButton = pageButtons[pageName];
            const Icon = pageButton.Icon;
            return (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Icon />}
                onClick={() => handleOperate(pageButton.method)}
              >
                {pageButton.text}
              </Button>
            );
          }
        })()}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => handleOperate('deleteUpload')}
        >
          删除
        </Button>
      </div>
      {taskDialogProp ? (
        <TaskDialog
          open={openUpload}
          setOpen={setOpenUpload}
          drives={drives}
          type={taskDialogProp.type}
          title={taskDialogProp.title}
          message={taskDialogProp.message}
        ></TaskDialog>
      ) : null}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < rowData.data.length
                  }
                  checked={
                    rowData.data.length > 0 &&
                    selected.length === rowData.data.length
                  }
                  onChange={handleClikCheckedAll}
                ></Checkbox>
              </TableCell>
              {['文件名', '大小', '进度', '速度', '剩余时间'].map((item) => (
                <TableCell align="center" key={item}>
                  <Typography variant="subtitle1">{item}</Typography>
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rowData.data.map((row) => (
              <Row
                key={row.uid}
                row={row}
                openId={openId}
                setOpenId={setOpenId}
                selected={selected}
                setSelected={setSelected}
              ></Row>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 15, 20]}
        component="div"
        count={rowData.count}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        labelRowsPerPage="每页行数："
      />
    </div>
  );
}

UploadInfo.propTypes = {
  drives: PropTypes.array.isRequired,
  pageName: PropTypes.string.isRequired,
};
