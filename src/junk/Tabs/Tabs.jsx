import React, { Component, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faList,
  faPaintBrush,
  faThumbtack,
  faRightLeft,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import Sentinel2Banner from './icons/data-space-sentinel-2-banner.svg?react';
import MultiSentinelBanner from './icons/multi-sentinel-banner.svg?react';
import './Tabs.scss';
import { t } from 'ttag';
import { TABS } from '../../const';
import store, { tabsSlice } from '../../store';
import { connect } from 'react-redux';
import { getSavedWorkspaceProducts } from '../../api/OData/workspace';

const Tabs = (props) => {
  useEffect(() => {
    (async () => {
      if (!!props.user.userdata) {
        const savedWorkspaceProducts = await getSavedWorkspaceProducts();
        store.dispatch(tabsSlice.actions.setSavedWorkspaceProducts(savedWorkspaceProducts));
      }
    })();
  }, [props.user]);

  const handleScrollOnSidePanel = (e) => {
    store.dispatch(tabsSlice.actions.setScrollTop(e.currentTarget.scrollTop));
  };

  const handleSelect = (renderKey) => {
    if (renderKey !== TABS.VISUALIZE_TAB) {
      // clear hash routes, except for 2 = Visualization tab
      window.location.hash = '';
    }
    props.onSelect(renderKey);
  };

  const renderTabButtons = () => {
    const defaultErrorMsg = t`Search for data first.`;
    return (
      <div className={`tabs-wrapper `}>
        <ul className="tab-list">
          {props.children
            .filter((t) => t)
            .map(
              /* Note that we are accessing childrens' props here. This breaks encapsulation principles,
           but allows us to declare tabs in a nicer way (we can define props directly on each tab)*/
              (tab) => {
                let icon = null;
                switch (tab.props.icon) {
                  case 'search':
                    icon = faMagnifyingGlass;
                    break;
                  case 'list':
                    icon = faList;
                    break;
                  case 'paint-brush':
                    icon = faPaintBrush;
                    break;
                  case 'thumb-tack':
                    icon = faThumbtack;
                    break;
                  case 'exchange-alt':
                    icon = faRightLeft;
                    break;
                  default:
                    icon = null;
                    break;
                }
                return (
                  <li
                    id={`${tab.props.id}Button`}
                    key={tab.props.renderKey}
                    value={tab.props.renderKey}
                    onClick={() =>
                      tab.props.enabled
                        ? handleSelect(tab.props.renderKey)
                        : props.onErrorMessage(tab.props.errorMsg || defaultErrorMsg)
                    }
                    className={props.activeIndex === tab.props.renderKey ? 'tab-selected' : ''}
                    disabled={!tab.props.enabled}
                  >
                    {tab.props.count ? (
                      <span className="counter-badge">{tab.props.count}</span>
                    ) : (
                      icon && <FontAwesomeIcon icon={icon} className="fa-icon" />
                    )}

                    {tab.props.title}
                  </li>
                );
              },
            )}
        </ul>
      </div>
    );
  };

  const renderWorksSpaceButtons = () => {
    const { scrollTop, savedWorkspaceProducts } = props;
    const workspacesCount = savedWorkspaceProducts ? savedWorkspaceProducts.length : null;
    return (
      <div className={`tabs-wrapper-workspace ${scrollTop > 0 ? 'box-shadow-divider' : ''}`}>
        <a
          href="https://shapps.dataspace.copernicus.eu/dashboard/"
          target="_blank"
          rel="noreferrer"
          className="tabs-wrapper-workspace-button"
          title={t`Sentinel Hub Dashboard`}
        >
          <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-icon" />
          {t`SH DASHBOARD`}
        </a>
        <a
          href="https://workspace.dataspace.copernicus.eu/workspace/my-products"
          target="_blank"
          rel="noreferrer"
          className="tabs-wrapper-workspace-button"
          title={t`Data Workspace`}
        >
          <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-icon" />
          {t`WORKSPACE`}
          {workspacesCount !== null && workspacesCount > 0 ? (
            <span className="counter-badge">{Math.min(workspacesCount, 99)}</span>
          ) : null}
        </a>
      </div>
    );
  };

  const renderContent = () => {
    return props.children
      .filter((t) => t)
      .map((panel) => {
        return (
          <div
            onScroll={handleScrollOnSidePanel}
            id={panel.props.id}
            key={panel.props.renderKey}
            className="tabPanelContainer"
          >
            <div className={panel.props.renderKey === props.activeIndex ? 'active' : 'none'}>{panel}</div>
          </div>
        );
      });
  };

  const showBannerBasedOnTab = () => {
    switch (props.activeIndex) {
      case 1:
        return <Sentinel2Banner className="sentinels-banner-position" />;

      case 2:
        return <MultiSentinelBanner className="sentinels-banner-position" />;

      case 3:
        return <Sentinel2Banner className="sentinels-banner-position" />;

      default:
        break;
    }
  };

  return (
    <div className="tabs-container">
      {renderTabButtons()}
      {props.isLoggedIn && renderWorksSpaceButtons()}
      {renderContent()}
      {showBannerBasedOnTab()}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  scrollTop: store.tabs.scrollTop,
  savedWorkspaceProducts: store.tabs.savedWorkspaceProducts,
  user: store.auth.user,
});

const ConnectedTabs = connect(mapStoreToProps)(Tabs);

class Tab extends Component {
  static defaultProps = {
    enabled: true,
  };

  render() {
    return this.props.children;
  }
}

export { Tab, ConnectedTabs as Tabs };
