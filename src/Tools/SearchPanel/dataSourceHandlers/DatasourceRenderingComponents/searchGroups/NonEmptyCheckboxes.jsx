import React from 'react';

export default class NonEmptyCheckboxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: new Set(props.initiallyChecked),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.checked !== this.state.checked) {
      this.props.onChange(Array.from(this.state.checked));
    }
  }

  toggleChecked = (ev) => {
    const v = ev.target.value;
    this.setState((oldState) => {
      let newChecked = new Set(oldState.checked);
      if (oldState.checked.has(v)) {
        newChecked.delete(v);
      } else {
        newChecked.add(v);
      }
      return {
        checked: newChecked,
      };
    });
  };

  render() {
    return (
      <div className="checkboxes">
        {Object.keys(this.props.choices).map((k) => (
          <label key={k} className="checkboxItem">
            <input
              type="checkbox"
              checked={this.state.checked.has(k)}
              value={k}
              onChange={this.toggleChecked}
            />
            {this.props.choices[k]}
          </label>
        ))}

        {this.state.checked.size === 0 && (
          <div className="warning">
            <i className="fa fa-exclamation-circle" /> {this.props.warningEmpty}
          </div>
        )}
      </div>
    );
  }
}
