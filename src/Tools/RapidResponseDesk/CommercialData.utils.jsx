import { t } from 'ttag';
import store, { collapsiblePanelSlice } from '../../store';

export const AreaAndTimeSectionProperties = Object.freeze({
  id: 'area-time',
  title: () => t`AREA & TIME`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAreaTimeExpanded(v)),
});

export const ProviderSectionProperties = Object.freeze({
  id: 'provider',
  title: () => t`PROVIDER`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setProviderExpanded(v)),
});

export const AdvancedSectionProperties = Object.freeze({
  id: 'advanced',
  title: () => t`ADVANCED`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAdvancedExpanded(v)),
});

export const OrderSection = Object.freeze({
  AREA_TIME: 'area-time',
  PROVIDER: 'provider',
  ADVANCED: 'advanced',
});
