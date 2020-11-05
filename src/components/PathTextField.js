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
import rpcRequest from '../jsonrpc';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

const useDialogWithPathListStyles = makeStyles((theme) => ({
  dialogPaper: {
    height: '100%',
    '@media(min-height: 720px)': {
      maxHeight: 720 - theme.spacing(8),
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
    paddingLeft: 8,
    paddingRight: 8,
    wordBreak: 'break-word',
  },
  listItemIcon: {
    minWidth: theme.spacing(5),
  },
  listItemText: {
    marginTop: 0,
    marginBottom: 0,
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
    list,
    onClickListItem,
    type,
  } = props;

  const pathSplited = useMemo(() => {
    let p = path;
    if (p.startsWith('/')) {
      p = p.slice(1);
    }
    if (p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    return p.split('/');
  }, [path]);

  const endWithFile = useMemo(() => !path.endsWith('/'), [path]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          maxItems={3}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={2}
        >
          <Typography />
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
          [classes.bigFile]: endWithFile,
        })}
      >
        {endWithFile ? (
          <Typography>{path.slice(path.lastIndexOf('/') + 1)}</Typography>
        ) : (
          <List className={classes.list}>
            {list.map((item, index) => (
              <ListItem
                key={index}
                button
                divider
                className={classes.listItem}
                onClick={(e) => onClickListItem(e, item)}
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
                  className={classes.listItemText}
                />
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
  onClickBreadcrumb: PropTypes.func,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['dir', 'file']).isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  onClickListItem: PropTypes.func,
  type: PropTypes.oneOf(['file', 'folder']),
};

DialogWithPathList.defaultProps = {
  list: [],
};

export default function PathTextField(props) {
  const {
    name,
    value,
    label,
    type,
    addPathChild,
    goPathAncestry,
    method,
    drive,
  } = props;
  const [pathList, setPathList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let res = await rpcRequest('Onedrive.' + method, {
        params: drive ? [drive.id, value] : [value],
        require_auth: true,
      });
      setPathList([].concat(res.data.result));
    };
    fetchData();
  }, [value, method, drive]);

  return (
    <React.Fragment>
      <TextField
        margin="dense"
        fullWidth
        label={label}
        value={value}
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
      <DialogWithPathList
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        path={value}
        onClickBreadcrumb={(e, index) => {
          e.preventDefault();
          goPathAncestry(name, index);
        }}
        list={pathList}
        onClickListItem={(e, item) => {
          addPathChild(name, item);
        }}
        type={type}
      />
    </React.Fragment>
  );
}

PathTextField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['file', 'folder']).isRequired,
  method: PropTypes.string.isRequired,
  drive: PropTypes.object,
  addPathChild: PropTypes.func,
  goPathAncestry: PropTypes.func,
};
