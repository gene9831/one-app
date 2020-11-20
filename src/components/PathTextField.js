import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import apiRequest from '../api';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { ListItemSecondaryAction, useMediaQuery } from '@material-ui/core';
import { bTokmg } from '../utils';

const useDialogWithPathListStyles = makeStyles((theme) => ({
  dialogPaper: {
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      '@media(min-height: 720px)': {
        maxHeight: 720 - theme.spacing(8),
      },
    },
  },
  pathContent: {
    overflowY: 'unset',
    wordBreak: 'break-word',
    flex: 'unset',
  },
  link: {
    cursor: 'pointer',
  },
  listContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  list: {
    padding: 0,
  },
  listItem: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    wordBreak: 'break-word',
  },
  listItemIcon: {
    minWidth: theme.spacing(5),
  },
  listItemText: {
    marginTop: 0,
    marginBottom: 0,
  },
  listItemTextMarginRight: {
    marginRight: 72,
  },
  xsPadding: {
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  bigFile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const DialogWithPathList = (props) => {
  const classes = useDialogWithPathListStyles();
  const {
    open,
    onClose,
    onClickBreadcrumb,
    path,
    childrenList,
    onClickListItem,
    type,
  } = props;

  const pathSplited = useMemo(() => {
    const p = path.replace(/\/$/g, '');
    let res = p.split('/');
    if (res[0] === '') res[0] = '根目录';
    return res;
  }, [path]);

  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={downXs}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: classes.dialogPaper,
      }}
    >
      <DialogTitle className={classes.xsPadding}>
        {type === 'file' ? '选择文件' : '选择目录'}
      </DialogTitle>
      <DialogContent className={clsx(classes.pathContent, classes.xsPadding)}>
        <Breadcrumbs
          maxItems={2}
          itemsBeforeCollapse={0}
          itemsAfterCollapse={2}
        >
          {pathSplited.map((item, index) =>
            index === pathSplited.length - 1 ? (
              <Typography key={index} color="textPrimary">
                {item}
              </Typography>
            ) : (
              <Link
                key={index}
                color="inherit"
                onClick={(e) => onClickBreadcrumb(e, index)}
                className={classes.link}
              >
                {item}
              </Link>
            )
          )}
        </Breadcrumbs>
      </DialogContent>
      <DialogContent
        dividers
        className={clsx(classes.listContent, classes.xsPadding, {
          [classes.bigFile]: typeof childrenList === 'number',
        })}
      >
        {typeof childrenList === 'number' ? (
          <Typography>{path.slice(path.lastIndexOf('/') + 1)}</Typography>
        ) : (
          <List className={classes.list}>
            {childrenList.map((item, index) => (
              <ListItem
                key={index}
                button
                divider
                className={classes.listItem}
                onClick={(e) => onClickListItem(e, item.value)}
                disabled={type !== 'file' && item.type === 'file'}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  {item.type === 'file' ? (
                    <InsertDriveFileIcon />
                  ) : (
                    <FolderOpenOutlinedIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.value}
                  className={clsx(classes.listItemText, {
                    [classes.listItemTextMarginRight]:
                      item.size !== undefined || item.childCount !== undefined,
                  })}
                />
                {item.size !== undefined || item.childCount !== undefined ? (
                  <ListItemSecondaryAction>
                    <Typography color="textSecondary" variant="body2">
                      {item.type === 'file'
                        ? bTokmg(item.size)
                        : `${item.childCount} 项`}
                    </Typography>
                  </ListItemSecondaryAction>
                ) : null}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          选择
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogWithPathList.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  path: PropTypes.string,
  childrenList: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
  onClickBreadcrumb: PropTypes.func,
  onClickListItem: PropTypes.func,
  type: PropTypes.oneOf(['file', 'folder']),
};

DialogWithPathList.defaultProps = {
  childrenList: [],
};

export default function PathTextField(props) {
  const {
    name,
    pathValue,
    label,
    type,
    method,
    drive_id,
    onPathValueChanged,
    setNewPath,
  } = props;
  const [pathList, setPathList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [firstPathValue, setFirstPathValue] = useState(pathValue);

  useEffect(() => {
    if (openDialog) {
      if (firstPathValue.length === 0) {
        // 保证 firstPathValue 是不为空的字符串
        setFirstPathValue(pathValue);
      }
    } else {
      setFirstPathValue(pathValue);
    }
  }, [firstPathValue, openDialog, pathValue]);

  useEffect(() => {
    if (method === 'listDrivePath' && !drive_id) return;
    if (pathValue) {
      const fetchData = async () => {
        let res = await apiRequest('Onedrive.' + method, {
          params:
            method === 'listDrivePath' ? [drive_id, pathValue] : [pathValue],
          require_auth: true,
        });
        setPathList(res.data.result);
      };
      fetchData();
    }
  }, [pathValue, method, drive_id]);

  const handlClose = () => {
    if (pathValue !== firstPathValue) {
      onPathValueChanged(name, pathValue);
    }
    setOpenDialog(false);
  };

  const addPathChild = (e, value) => {
    let newPath = pathValue.replace(/\/$/g, '') + '/' + value;
    setNewPath(name, newPath);
  };

  const goPathAncestry = (e, index) => {
    e.preventDefault();
    let newPath = pathValue
      .split('/')
      .slice(0, index + 1)
      .join('/');
    if (newPath.indexOf('/') < 0) {
      // 这个仅仅是为了美观点
      newPath += '/';
    }
    setNewPath(name, newPath);
  };

  return (
    <React.Fragment>
      <TextField
        margin="dense"
        fullWidth
        label={label}
        value={pathValue}
        onClick={() => setOpenDialog(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {type === 'file' ? (
                <InsertDriveFileOutlinedIcon />
              ) : (
                <FolderOpenOutlinedIcon />
              )}
            </InputAdornment>
          ),
          readOnly: true,
        }}
      ></TextField>
      {pathValue ? (
        <DialogWithPathList
          open={openDialog}
          onClose={handlClose}
          path={pathValue}
          childrenList={pathList}
          onClickListItem={addPathChild}
          onClickBreadcrumb={goPathAncestry}
          type={type}
        />
      ) : null}
    </React.Fragment>
  );
}

PathTextField.propTypes = {
  name: PropTypes.string.isRequired,
  pathValue: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['file', 'folder']).isRequired,
  method: PropTypes.string.isRequired,
  drive_id: PropTypes.string,
  setNewPath: PropTypes.func,
  onPathValueChanged: PropTypes.func,
};

PathTextField.defaultProps = {
  value: '',
  onPathValueChanged: () => {},
};
