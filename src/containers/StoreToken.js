import { useEffect } from 'react';
import { connect } from 'react-redux';
import { AUTH_STATUS } from '../actions';
import cookies from '../cookies';

let StoreToken = ({ auth }) => {
  useEffect(() => {
    if (auth.status === AUTH_STATUS.PASS) {
      cookies.set('token', auth.token, { path: '/', expires: auth.expires });
    } else if (auth.status === AUTH_STATUS.OUT) {
      cookies.remove('token', { path: '/' });
    }
  }, [auth]);
  return null;
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

StoreToken = connect(mapStateToProps)(StoreToken);

export default StoreToken;
