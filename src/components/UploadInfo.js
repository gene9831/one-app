import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import Axios from 'axios';
import { Button, Typography } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Checkbox from '@material-ui/core/Checkbox';
import TaskDialog from './TaskDialog';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import { OD_ADMIN_API } from '../App';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
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
  greenCell: {
    color: 'green',
  },
});

function Row(props) {
  const { row, openId, setOpenId, selected, setSelected } = props;
  const classes = useRowStyles();
  const [cellClass, setCellClass] = useState(classes.greenCell);

  const bTokmg = (size) => {
    let kb = size / 1024;
    if (kb < 1000) {
      return kb.toFixed(1) + 'KB';
    }
    let mb = kb / 1024;
    if (mb < 1000) {
      return mb.toFixed(1) + 'MB';
    }
    return (mb / 1024).toFixed(1) + 'GB';
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

  useEffect(() => {
    if (row.upload_url === null) {
      setCellClass(null);
    }
  }, [row.upload_url]);

  return (
    <React.Fragment>
      <TableRow className={classes.root} hover>
        <TableCell>
          <Checkbox color="primary" onChange={handleOnSelected} />
        </TableCell>
        <TableCell align="left">{row.filename}</TableCell>
        <TableCell align="center">{bTokmg(row.size)}</TableCell>
        <TableCell align="center">
          {/* 速度 */}
          {row.finished === row.size || row.upload_url === null
            ? '---'
            : bTokmg(row.speed) + 's'}
        </TableCell>
        <TableCell align="center" className={cellClass}>
          {/* 进度 */}
          {(() => {
            if (row.upload_url === null) {
              return '准备中';
            }
            if (row.finished === row.size) {
              return '已完成';
            }
            return (
              <CircularProgressWithLabel
                value={(row.finished / row.size) * 100}
              />
            );
          })()}
        </TableCell>
        <TableCell align="center">
          {/* 剩余时间 */}
          {row.finished === row.size || row.upload_url === null
            ? '---'
            : sTomhd((row.size - row.finished) / row.speed)}
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
    running: PropTypes.bool.isRequired,
    spend_time: PropTypes.number.isRequired,
    file_path: PropTypes.string.isRequired,
    upload_path: PropTypes.string.isRequired,
    upload_url: PropTypes.string,
    created_date_time: PropTypes.string.isRequired,
    finished_date_time: PropTypes.string.isRequired,
  }).isRequired,
  openId: PropTypes.string.isRequired,
  setOpenId: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
};

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

export default function UploadInfo(props) {
  const classes = useStyles();
  const { drive } = props;
  const [openId, setOpenId] = useState('');
  const [rows, setRows] = useState([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [openUploadFolder, setOpenUploadFolder] = useState(false);
  const [selected, setSelected] = useState([]);

  const handleDelete = () => {
    if (selected.length === 0) return;
    const fetchData = async () => {
      await Axios.post(
        OD_ADMIN_API,
        {
          jsonrpc: '2.0',
          method: 'Onedrive.deleteUpload',
          params: { uids: selected },
          id: '1',
        },
        { headers: { 'X-Password': 'secret' } }
      );
      setSelected([]);
    };
    fetchData();
  };

  useEffect(() => {
    if (drive !== null) {
      const fetchData = async () => {
        let res = await Axios.post(
          OD_ADMIN_API,
          {
            jsonrpc: '2.0',
            method: 'Onedrive.uploadStatus',
            params: [drive.id],
            id: '1',
          },
          { headers: { 'X-Password': 'secret' } }
        );
        setRows(res.data.result);
      };
      fetchData();
      const timer = setInterval(() => {
        fetchData();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [drive]);

  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        className={classes.button}
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => setOpenUpload(true)}
      >
        上传
      </Button>
      <TaskDialog
        open={openUpload}
        setOpen={setOpenUpload}
        drive={drive}
        type={'file'}
        title={'上传'}
        message={'上传文件到OneDrive，文件指的是服务端文件'}
      ></TaskDialog>
      <Button
        variant="outlined"
        color="primary"
        className={classes.button}
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => setOpenUploadFolder(true)}
      >
        批量上传
      </Button>
      <TaskDialog
        open={openUploadFolder}
        setOpen={setOpenUploadFolder}
        drive={drive}
        type={'folder'}
        title={'批量上传'}
        message={'批量上传文件到OneDrive，上传目录下的所有文件，不包括子目录'}
      ></TaskDialog>
      <Button
        variant="outlined"
        color="default"
        className={classes.button}
        startIcon={<PauseCircleOutlineIcon />}
      >
        暂停
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        className={classes.button}
        startIcon={<DeleteOutlineIcon />}
        onClick={handleDelete}
      >
        删除
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" gutterBottom>
                  文件名
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" gutterBottom>
                  大小
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" gutterBottom>
                  速度
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" gutterBottom>
                  进度
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" gutterBottom>
                  剩余时间
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
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
    </div>
  );
}

UploadInfo.propTypes = {
  drive: PropTypes.object,
};
