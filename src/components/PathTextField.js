import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ListItem from '@material-ui/core/ListItem';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Fade from '@material-ui/core/Fade';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Axios from 'axios';
import { OD_ADMIN_API } from '../App';

const useStyles = makeStyles((theme) => ({
  popper: {
    zIndex: theme.zIndex.modal,
  },
  cell: {
    padding: 'unset',
  },
  container: {
    maxHeight: '300px',
  },
  checkButton: {
    bottom: '5px',
  },
  item: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: 0,
    paddingBottom: 0,
  },
  itemIcon: {
    minWidth: '2rem',
  },
}));

const initPathList = [{ value: '..', type: 'dir' }];

export default function PathTextField(props) {
  const classes = useStyles();
  const { id, value, setValue, onlyDir } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [pathList, setPathList] = useState(initPathList);
  const [textField, setTextField] = useState(null);
  const [popperSize, setPopperSize] = useState(0);
  const open = Boolean(anchorEl);

  const handleClickTextField = (event) => {
    setAnchorEl(event.currentTarget);
    setTextField(event.currentTarget);
  };

  const handlClosePopper = () => {
    setAnchorEl(null);
  };

  const handleClickPath = (item) => {
    if (item.value === '..') {
      if (value !== '/') {
        let value1 = value;
        if (value1.endsWith('/')) {
          value1 = value1.slice(0, -1);
        }
        let index = value1.lastIndexOf('/');
        if (index >= 0) setValue(id, value1.slice(0, index + 1));
      }
    } else {
      setValue(
        id,
        value.concat(item.value).concat(item.type === 'dir' ? '/' : '')
      );
    }
    textField.focus();
    let len = textField.value.length;
    textField.setSelectionRange(len, len);
  };

  useEffect(() => {
    if (textField !== null) setPopperSize(textField.offsetWidth);
  }, [textField]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await Axios.post(
        OD_ADMIN_API,
        {
          jsonrpc: '2.0',
          method: 'Onedrive.listSysPath',
          params: [value, onlyDir],
          id: '1',
        },
        { headers: { 'X-Password': 'secret' } }
      );
      setPathList(initPathList.concat(res.data.result));
    };
    fetchData();
  }, [value, onlyDir]);

  return (
    <React.Fragment>
      <TextField
        margin="dense"
        fullWidth
        label={onlyDir ? '文件夹路径' : '文件路径'}
        value={value}
        onChange={(e) => setValue(id, e.target.value)}
        onFocus={handleClickTextField}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {onlyDir ? (
                <FolderOpenOutlinedIcon />
              ) : (
                <InsertDriveFileOutlinedIcon />
              )}
            </InputAdornment>
          ),
          endAdornment:
            anchorEl !== null ? (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  className={classes.checkButton}
                  onClick={handlClosePopper}
                >
                  确定
                </Button>
              </InputAdornment>
            ) : null,
        }}
      ></TextField>
      <Popper
        open={open}
        anchorEl={anchorEl}
        className={classes.popper}
        placement="bottom-start"
        style={{ width: popperSize + 'px' }}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={100}>
            <Paper>
              <TableContainer className={classes.container}>
                <Table>
                  <TableBody>
                    {pathList.map((item, index) => (
                      <TableRow
                        key={index}
                        hover
                        onClick={() => handleClickPath(item)}
                      >
                        <TableCell className={classes.cell}>
                          <ListItem className={classes.item}>
                            <ListItemIcon className={classes.itemIcon}>
                              {item.type === 'dir' ? (
                                <FolderOpenOutlinedIcon fontSize="small"></FolderOpenOutlinedIcon>
                              ) : (
                                <InsertDriveFileIcon fontSize="small"></InsertDriveFileIcon>
                              )}
                            </ListItemIcon>
                            <ListItemText>{item.value}</ListItemText>
                          </ListItem>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  );
}

PathTextField.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  onlyDir: PropTypes.bool.isRequired,
};
