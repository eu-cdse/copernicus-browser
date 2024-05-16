import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { t } from 'ttag';

import ExternalLink from '../../ExternalLink/ExternalLink';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';

import PencilIcon from './icons/pencil-icon.svg?react';

class Description extends React.Component {
  state = {
    editing: false,
    newContent: this.props.content,
  };

  handleContentChange = (e) => {
    e.stopPropagation();
    this.setState({
      newContent: e.target.value ? e.target.value : '',
    });
  };

  handleContentChangeConfirm = (e) => {
    e.stopPropagation();
    this.props.onDescriptionConfirm(this.state.newContent);
    this.toggleEditing();
  };

  handleContentChangeCancel = (e) => {
    e.stopPropagation();
    this.toggleEditing();
  };

  toggleEditing = () => {
    this.setState((prevState) => ({
      editing: !prevState.editing,
      newContent: this.props.content,
    }));
  };

  render() {
    const { newContent } = this.state;
    const { canEdit, content, showContent } = this.props;

    return showContent ? (
      <div className="pin-description-container">
        {this.state.editing ? (
          <textarea name="description" rows={8} onChange={this.handleContentChange} value={newContent} />
        ) : content === '' || !content ? (
          <NotificationPanel type="info" msg={t`This pin currently has no description.`} />
        ) : (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            children={content || ''}
            components={{
              link: (props) => <ExternalLink href={props.href}>{props.children}</ExternalLink>,
            }}
          />
        )}
        <div className="description-edit-controls">
          {this.state.editing ? (
            <>
              <div
                className="clickable cancel"
                title={t`Reject changes`}
                onClick={this.handleContentChangeCancel}
              >
                <i className="fa fa-close" />
              </div>
              <div
                className="clickable confirm"
                title={t`Confirm changes`}
                onClick={this.handleContentChangeConfirm}
              >
                <i className="fa fa-check" />
              </div>
            </>
          ) : canEdit ? (
            <span onClick={this.toggleEditing}>
              <PencilIcon />
            </span>
          ) : null}
        </div>
      </div>
    ) : null;
  }
}

export default Description;
