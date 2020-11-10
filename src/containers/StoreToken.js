import { useEffect } from 'react';
import { connect } from 'react-redux';
import cookies from '../cookies';

let StoreToken = ({ auth }) => {
  useEffect(() => {
    console.log(auth);
    if (auth.authed) {
      cookies.set('token', auth.token, { expires: auth.expires });
    } else {
      cookies.remove('token');
    }
  }, [auth]);
  return null;
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

StoreToken = connect(mapStateToProps)(StoreToken);

export default StoreToken;
