import React from 'react';

import NonEmptyCheckboxes from './NonEmptyCheckboxes';

import './CheckboxesWithChildren.scss';

export default class CheckboxesWithChildren extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: new Set(props.initiallyChecked),
      checkedChildren: props.initiallyCheckedChildren,
    };
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
    }, this.onChange);
  };

  setCheckedChildren = (checked, parent) => {
    this.setState((prevState) => {
      prevState.checkedChildren[parent] = checked;
      return {
        checkedChildren: prevState.checkedChildren,
      };
    }, this.onChange);
  };

  onChange = () => {
    const { checked, checkedChildren } = this.state;
    const parents = Array.from(checked);
    const children = parents.map((p) => checkedChildren[p]).flat();
    this.props.onChange(parents, children);
  };

  render() {
    return (
      <div className="checkboxes with-children">
        {Object.keys(this.props.choices).map((k) => (
          <div className="parent" key={k}>
            <label key={k} className="checkboxItem">
              <input
                type="checkbox"
                checked={this.state.checked.has(k)}
                value={k}
                onChange={this.toggleChecked}
              />
              {this.props.choices[k]}
            </label>
            {this.state.checked.has(k) && (
              <div className="child twoItemsPerLine">
                <label className="child-label">{this.props.childrenLabel}</label>
                <NonEmptyCheckboxes
                  choices={this.props.children[k]}
                  initiallyChecked={this.state.checkedChildren[k]}
                  onChange={(checked) => this.setCheckedChildren(checked, k)}
                  warningEmpty={this.props.warningEmptyChildren}
                />
              </div>
            )}
          </div>
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
