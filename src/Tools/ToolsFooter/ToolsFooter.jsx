import React, { Component } from 'react';
import { connect } from 'react-redux';

import ExternalLink from '../../ExternalLink/ExternalLink';
import { VERSION_INFO } from '../../VERSION';
import { t } from 'ttag';

import EuropeBanner from './icons/europe-banner.svg?react';
import EsaBanner from './icons/esa-banner.svg?react';
import CopernicusBanner from './icons/copernicus-banner.svg?react';

import './ToolsFooter.scss';

class ToolsFooter extends Component {
  render() {
    // const branch = VERSION_INFO.branch ? ` ${VERSION_INFO.branch}` : null;
    const commit = VERSION_INFO.commit ? ` [${VERSION_INFO.commit.substring(0, 8)}]` : null;
    const tag = VERSION_INFO.tag;

    return (
      <div className="tools-footer">
        <div className="footer-info">
          {/* {!this.props.user && (
            <div className="free-signup">
              <ExternalLink
                href={`${window.API_ENDPOINT_CONFIG.AUTH_BASEURL}/oauth/subscription?origin=EOBrowser&param_client_id=${import.meta.env.VITE_CLIENTID}`}
              >
                {t`Free sign up`}
              </ExternalLink>
              &nbsp;
              <span>{t`for all features`}</span>
            </div>
          )} */}
          <div className="credentials">
            <div className="banners">
              <ExternalLink className="europe-banner" href="https://commission.europa.eu/index_en">
                <EuropeBanner />
              </ExternalLink>
              <ExternalLink
                className="copernicus-banner"
                href="https://www.copernicus.eu/en/about-copernicus"
              >
                <CopernicusBanner />
              </ExternalLink>
              <ExternalLink className="esa-banner" href="https://www.esa.int/">
                <EsaBanner />
              </ExternalLink>
            </div>

            <div className="links">
              <div className="about-container">
                <ExternalLink
                  className="about"
                  href="https://documentation.dataspace.copernicus.eu/Applications/Browser.html"
                >
                  {t`About`}
                </ExternalLink>
              </div>
              <div className="support-container">
                <ExternalLink className="support" href="https://helpcenter.dataspace.copernicus.eu/hc/en-gb">
                  {t`Support`}
                </ExternalLink>
              </div>
            </div>

            <div className="app-version">
              {VERSION_INFO.tag ? (
                <div>{tag}</div>
              ) : VERSION_INFO.commit ? (
                <div title={`${commit}`}>
                  {/* {branch} */}
                  {commit}
                </div>
              ) : (
                <div>Local build</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
});

export default connect(mapStoreToProps, null)(ToolsFooter);
