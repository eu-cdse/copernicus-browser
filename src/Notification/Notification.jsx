import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from '../components/Modal/Modal';

import { NotificationPanel } from './NotificationPanel';
import store, { notificationSlice } from '../store';

class Notification extends Component {
  render() {
    return (
      <Modal
        onClose={() => store.dispatch(notificationSlice.actions.removeNotification())}
        animation="slideUp"
        visible={!!this.props.msg}
        customStyles={{
          width: '500px',
          height: 'auto',
          bottom: 'auto',
          top: '30%',
          transform: 'translateY(-50%)',
        }}
        closeOnEsc={true}
        className="notification-modal"
      >
        <NotificationPanel type={this.props.type} msg={this.props.msg} />
      </Modal>
    );
  }
}

const mapStoreToProps = (store) => ({
  type: store.notification.type,
  msg: store.notification.msg,
});

export default connect(mapStoreToProps, null)(Notification);
