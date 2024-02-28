import React from 'react';

export default class LegendFromUrl extends React.Component {
  static defaultProps = {
    legendUrl: null,
    onLoadError: () => {},
  };
  state = {
    error: false,
    loading: true,
  };

  handleError = () => {
    this.setState({ error: true, loading: false });
    this.props.onLoadError();
  };

  render() {
    const { error, loading } = this.state;
    const { legendUrl } = this.props;
    if (error) {
      return null;
    }
    return (
      <>
        {loading && <i className="fa fa-spinner fa-spin fa-fw" />}
        <img
          src={legendUrl}
          alt="legend"
          onError={this.handleError}
          onLoad={() => this.setState({ loading: false })}
        />
      </>
    );
  }
}
