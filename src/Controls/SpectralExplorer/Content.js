import { useEffect, useState } from 'react';
import { t } from 'ttag';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import ValuesTable from './ValuesTable';
import Legend from './Legend';
import { commonSpectralSignatures } from './commonSpectralSignatures';
import LineChart from './LineChart';
import { createSeriesId, getCentralWaveLength, getTitleForGeometryType } from './SpectralExplorer.utils';
import { connect } from 'react-redux';
import store, { spectralExplorerSlice } from '../../store';

const SPECTRAL_EXPLORER_TABS = {
  CHART: 'CHART',
  VALUES: 'VALUES',
};

const tabs = {
  [SPECTRAL_EXPLORER_TABS.CHART]: {
    title: t`Chart`,
    render: ({ series, bands, selected }) => <LineChart series={series} bands={bands} selected={selected} />,
  },
  [SPECTRAL_EXPLORER_TABS.VALUES]: {
    title: t`Values`,
    render: ({ series, bands, selected }) => (
      <ValuesTable series={series} bands={bands} selected={selected} />
    ),
  },
};

const Content = ({ values, datasetId, geometryType, bands, loading, error, selectedSeries }) => {
  const [selectedTab, setSelectedTab] = useState(SPECTRAL_EXPLORER_TABS.CHART);
  const [series, setSeries] = useState(null);

  useEffect(() => {
    const allSeries = [];
    if (datasetId && values) {
      const seriesId = createSeriesId({ geometryType: geometryType, datasetId: datasetId });
      allSeries.push({
        id: seriesId,
        title: getTitleForGeometryType(geometryType),
        color: '#b6bf00',
        renderIdx: Number.POSITIVE_INFINITY,
        coordinates: values
          .map((band) => ({
            name: band.name,
            value: band.stats.mean,
          }))
          .sort((a, b) => getCentralWaveLength(a.name, bands) - getCentralWaveLength(b.name, bands)),
      });

      if (!selectedSeries?.[datasetId]) {
        store.dispatch(
          spectralExplorerSlice.actions.setSelectedSeries({
            datasetId: datasetId,
            series: [seriesId],
          }),
        );
      }

      if (datasetId && commonSpectralSignatures && commonSpectralSignatures[datasetId]) {
        allSeries.push(
          ...commonSpectralSignatures[datasetId].map((css, index) => ({
            ...css,
            coordinates: css.bands.sort(
              (a, b) => getCentralWaveLength(a.name, bands) - getCentralWaveLength(b.name, bands),
            ),
            renderIdx: index,
          })),
        );
      }
    }
    setSeries(allSeries);
  }, [values, datasetId, geometryType, selectedSeries, bands]);

  if (loading || error) {
    return null;
  }

  if (!values) {
    return <div className="error-message ">{t`No data available`}</div>;
  }

  return (
    <div className="content">
      <div className="tabs">
        {Object.keys(tabs).map((tabId) => {
          return tabId === selectedTab ? (
            <EOBButton key={tabId} text={tabs[tabId].title} className="selected secondary" />
          ) : (
            <EOBButton
              key={tabId}
              className="secondary"
              text={tabs[tabId].title}
              onClick={() => {
                setSelectedTab(tabId);
              }}
            />
          );
        })}
      </div>
      <div className="container">
        {tabs[selectedTab].render({
          bands: bands,
          series: series,
          selected: selectedSeries?.[datasetId] || [],
        })}
        <Legend series={series} selectedSeries={selectedSeries} datasetId={datasetId} />
      </div>
    </div>
  );
};
const mapStoreToProps = (store) => ({
  selectedSeries: store.spectralExplorer.selectedSeries,
});

export default connect(mapStoreToProps, null)(Content);
