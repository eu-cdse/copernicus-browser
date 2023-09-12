import React from 'react';
import { BandsToRGB } from './BandsToRGB';

export class GroupedBandsToRGB extends React.Component {
  /*
    This component groups bands together and only allows bands within a group to be used together.
    But, since the BandsToRGB component is a controlled component (and the source of truth for it
    in EO Browser is Redux store), we wanted to make GroupedBandsToRGB behave in a similar way.
  */
  static defaultProps = {
    groupedBands: undefined,
    value: undefined,
    onChange: (value) => {},
  };

  componentDidMount() {
    if (!this.valueIsValid()) {
      // EO Browser (helpfully) presets the value so that the bands are from different groups. Since it
      // is difficult to figure out where this happens and why, we go in defensive mode - we simply detect
      // such condition here and trigger onChange() as if the first possible group was selected:
      const { groupedBands } = this.props;
      const nonEmptyGroupsIds = Object.keys(groupedBands).filter((g) => groupedBands[g].length > 0);
      this.changeSelectedGroup(nonEmptyGroupsIds[0]);
    }
  }

  changeSelectedGroup = (selectedGroupId) => {
    // we don't actually change the selected group per se (because this component is controlled), instead we
    // change the value (by calling onChange) so that when we render, this group is selected:
    const { groupedBands } = this.props;
    const bands = groupedBands[selectedGroupId];
    const newValue = {
      r: bands[0].name,
      g: bands[Math.min(1, bands.length - 1)].name, // we are not sure that there are at least 3 bands in the group
      b: bands[Math.min(2, bands.length - 1)].name,
    };
    this.props.onChange(newValue);
  };

  getSelectedGroupId = () => {
    // we guess the selected group from the first band in value (we check which group it belongs to), and assume
    // that other bands belong to the same group:
    const { groupedBands, value } = this.props;
    const selectedGroupId = Object.keys(groupedBands).find((g) =>
      groupedBands[g].find((b) => b.name === value.r),
    );
    return selectedGroupId;
  };

  valueIsValid() {
    const { groupedBands, value } = this.props;
    const selectedGroupId = this.getSelectedGroupId();
    if (!selectedGroupId) {
      return false;
    }
    for (let channel of ['r', 'g', 'b']) {
      if (!groupedBands[selectedGroupId].find((b) => b.name === value[channel])) {
        return false;
      }
    }
    return true;
  }

  render() {
    if (!this.valueIsValid()) {
      return null;
    }

    const { groupedBands, value, onChange } = this.props;
    const groupsIds = Object.keys(groupedBands);
    const nonEmptyGroupsIds = groupsIds.filter((g) => groupedBands[g].length > 0);
    const selectedGroupId = this.getSelectedGroupId();

    return (
      <div className="grouped-bands-to-rgb">
        {nonEmptyGroupsIds.map((g) => (
          <button
            key={g}
            className={`group-tab ${selectedGroupId === g ? 'selected' : ''}`}
            onClick={() => (g !== selectedGroupId ? this.changeSelectedGroup(g) : false)}
          >
            {g}
          </button>
        ))}

        <BandsToRGB
          key={selectedGroupId}
          bands={groupedBands[selectedGroupId]}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }
}
