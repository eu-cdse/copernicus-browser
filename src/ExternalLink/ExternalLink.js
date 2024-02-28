import React, { Component } from 'react';

class ExternalLink extends Component {
  render() {
    return (
      <a
        id={this.props.id}
        className={this.props.className}
        title={this.props.title}
        href={this.props.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {this.props.children}
      </a>
    );
  }
}

export default ExternalLink;
