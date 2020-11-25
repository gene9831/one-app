import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  makeStyles,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import apiRequest, { FILE_URL } from '../api';
import { bTokmg } from '../utils';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { setGlobalSnackbarMessage } from '../actions';
import { connect } from 'react-redux';
import ButtonWithLoading from './ButtonWithLoading';

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: theme.spacing(1),
  },
  textOverflow: {
    wordBreak: 'break-word',
  },
}));

let DialogWithFIle = (props) => {
  const classes = useStyles();
  const { open, onClose, file, setGlobalSnackbarMessage } = props;
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (file.size <= 50 * 1024 * 1024) {
      // 50M一下不需要生成共享连接
      setFileUrl(`${FILE_URL}/${file.id}/${file.name}`);
    } else {
      const fetchData = async () => {
        let res = await apiRequest('Onedrive.getItemSharedLink', {
          params: [file.id],
        });
        setFileUrl(res.data.result);
      };
      fetchData();
    }
  }, [file, open]);

  const handleCreateSharedLink = () => {
    setLoading(true);
    const fetchData = async () => {
      let res = await apiRequest('Onedrive.createItemSharedLink', {
        params: [file.id],
      });
      setFileUrl(res.data.result);
    };
    fetchData()
      .catch((e) => {
        if (e.response) {
          setGlobalSnackbarMessage(e.response.data.error.message);
        } else {
          setGlobalSnackbarMessage('网络错误');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>文件</DialogTitle>
      <DialogContent>
        <DialogContentText className={classes.textOverflow}>
          文件名：{file.name}
        </DialogContentText>
        <DialogContentText className={classes.textOverflow}>
          MIME 类型：{file.file && file.file.mimeType}
        </DialogContentText>
        <DialogContentText>
          大小：{`${bTokmg(file.size)} (${file.size} 字节)`}
        </DialogContentText>
        <div className={classes.buttons}>
          {fileUrl ? (
            <React.Fragment>
              <CopyToClipboard text={fileUrl}>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => setGlobalSnackbarMessage('已复制')}
                >
                  复制链接
                </Button>
              </CopyToClipboard>
              <Button
                color="primary"
                variant="outlined"
                component={Link}
                href={fileUrl}
              >
                直接下载
              </Button>
            </React.Fragment>
          ) : (
            <ButtonWithLoading
              color="primary"
              variant="outlined"
              loading={loading}
              onClick={handleCreateSharedLink}
            >
              生成链接
            </ButtonWithLoading>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogWithFIle.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  file: PropTypes.object.isRequired,
  setGlobalSnackbarMessage: PropTypes.func,
};

DialogWithFIle.defaultProps = {
  file: {},
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

DialogWithFIle = connect(null, mapDispatchToProps)(DialogWithFIle);

export default DialogWithFIle;
