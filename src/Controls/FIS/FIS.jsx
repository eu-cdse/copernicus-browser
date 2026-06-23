import React, { Component } from 'react';
import { connect } from 'react-redux';
import FileSaver from 'file-saver';
import { t } from 'ttag';

import { EOBCCSlider } from '../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import {
  CancelToken,
  CRS_EPSG3857,
  CRS_EPSG4326,
  StatisticsProviderType,
  StatisticsUtils,
} from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import store, { modalSlice } from '../../store';
import { getDatasetLabel } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  constructCSVFromData,
  getRecommendedResolutionForDatasetId,
  getRequestGeometry,
  getStatisticsLayer,
} from './FIS.utils';
import { DraggableDialogBox } from '../../components/DraggableDialogBox/DraggableDialogBox';

import styleVariables from '../../variables.module.scss';

import './FIS.scss';
import { getErrorFetchingDataMsg } from '../../junk/ConstMessages';
import { sanitizeFilenameSegment } from '../../utils/filename';

class FIS extends Component {
  state = { fetchingInProgress: true, maxCCAllowed: 1.0 };
  TIME_INTERVALS = [
    { label: t`5 years`, duration: moment.duration(5, 'year') },
    { label: t`2 years`, duration: moment.duration(2, 'year') },
    { label: t`1 year`, duration: moment.duration(1, 'year') },
    { label: t`6 months`, duration: moment.duration(6, 'month') },
    { label: t`3 months`, duration: moment.duration(3, 'month') },
    { label: t`1 month`, duration: moment.duration(1, 'month') },
  ];
  maxCCAllowed = 1.0;
  MAX_REQUEST_INTERVAL = moment.duration(2, 'month');

  cancelToken = null;

  componentDidMount() {
    this.cancelToken = new CancelToken();
    const selectedTimeIntervalIndex = this.TIME_INTERVALS.length - 1;
    const toTime = this.props.toTime.clone().utc();
    const fromTime = this.props.toTime
      .clone()
      .utc()
      .subtract(this.TIME_INTERVALS[selectedTimeIntervalIndex].duration)
      .startOf('day'); // shortest interval by default, then user can request more
    this.setState({
      fromTime: fromTime,
      toTime: toTime,
      selectedTimeIntervalIndex,
    });
    this.availableData = {
      fromTime: toTime, // we don't have any data yet, so from == to
      toTime: toTime,
      data: {},
      cloudCoverageData: [],
    };
    this.fetchFISData(fromTime, toTime);
  }

  componentWillUnmount() {
    if (this.cancelToken) {
      this.cancelToken.cancel();
    }
  }

  onClose = () => {
    store.dispatch(modalSlice.actions.removeModal());
  };

  setMaxCCAllowed = (valuePercent) => {
    this.maxCCAllowed = valuePercent / 100.0;
    this.updateStateWithData();
  };

  onIntervalChange(newIntervalIndex) {
    const fromTime = this.state.toTime
      .clone()
      .subtract(this.TIME_INTERVALS[newIntervalIndex].duration)
      .startOf('day');
    this.setState({
      selectedTimeIntervalIndex: newIntervalIndex,
      fromTime: fromTime,
    });
    this.fetchFISData(fromTime, this.state.toTime);
  }

  fetchFISData = async (fromTime) => {
    if (!fromTime.isBefore(this.availableData.fromTime)) {
      return;
    }

    const {
      layerId,
      customSelected,
      evalscript,
      datasetId,
      visualizationUrl,
      aoiGeometry,
      poiGeometry,
      poiOrAoi,
    } = this.props;

    const { supportStatisticalApi, statisticsLayer, statsOutputName } = await getStatisticsLayer({
      customSelected,
      datasetId,
      evalscript,
      layerId,
      visualizationUrl,
    });

    const geometry = poiOrAoi === 'aoi' ? aoiGeometry : poiGeometry;
    const crs = supportStatisticalApi ? CRS_EPSG3857 : CRS_EPSG4326;

    const recommendedResolution = getRecommendedResolutionForDatasetId(datasetId, geometry);
    const requestGeometry = getRequestGeometry(datasetId, geometry, crs);

    let batchFromTime = moment
      .max(fromTime, this.availableData.fromTime.clone().subtract(this.MAX_REQUEST_INTERVAL))
      .startOf('day');
    let batchToTime = moment.utc(this.availableData.fromTime.clone()).add(1, 'day').startOf('day');

    if (!batchFromTime.isSame(fromTime)) {
      this.setState({
        fetchingInProgress: false,
        fetchingBatches: true,
      });
    } else {
      this.setState({ fetchingInProgress: true });
    }

    while (fromTime.isBefore(this.availableData.fromTime)) {
      const statsParams = {
        geometry: requestGeometry,
        crs: crs,
        fromTime: batchFromTime,
        toTime: batchToTime,
        resolution: recommendedResolution,
        bins: 10,
      };

      if (supportStatisticalApi) {
        statsParams['output'] = statsOutputName;
      }

      const statisticsProvider = supportStatisticalApi
        ? StatisticsProviderType.STAPI
        : StatisticsProviderType.FIS;

      let data = await statisticsLayer
        .getStats(statsParams, { cancelToken: this.cancelToken }, statisticsProvider)
        .catch((err) => this.handleRequestError(err));

      if (!data) {
        break;
      }

      if (statisticsProvider === StatisticsProviderType.STAPI && data.status !== 'OK') {
        const errors = new Set();
        //try to get error message from response
        try {
          if (data.data && data.data.length > 0) {
            data.data.forEach((interval) => {
              if (interval.error) {
                errors.add(interval.error.message);
              }
            });
          }
        } catch (e) {
          // do nothing
        }

        this.handleRequestError(`${getErrorFetchingDataMsg()}. ${Array.from(errors).join(' ')}`);
        break;
      }

      if (statisticsProvider === StatisticsProviderType.STAPI) {
        data = StatisticsUtils.convertToFISResponse(data.data, statsOutputName);
      }

      this.onDataReceived(batchFromTime, batchToTime, data, true);
      batchToTime = batchFromTime.clone();
      batchFromTime = moment
        .max(fromTime, this.availableData.fromTime.clone().subtract(this.MAX_REQUEST_INTERVAL))
        .startOf('day');
    }

    this.setState({
      fetchingBatches: false,
    });
  };

  handleRequestError(err) {
    // try to extract a meaningful error message from response body:
    if (err.response) {
      try {
        const errorMsg = err.response.data.error.errors[0].violation
          ? `Error: ${err.response.data.error.errors[0].violation}`
          : `Error: ${err.response?.data?.error?.message}`;
        this.setState({
          fetchingInProgress: false,
          errorMsg,
        });
        console.log(errorMsg);
      } catch (e) {
        console.log(err, e);
        this.setState({
          fetchingInProgress: false,
          errorMsg: getErrorFetchingDataMsg(),
        });
      }
    } else {
      console.log(err);
      this.setState({
        fetchingInProgress: false,
        errorMsg: getErrorFetchingDataMsg(),
      });
    }
  }

  exportCSV = () => {
    const { lineData: data, fromTime, isCloudCoverageDataAvailable } = this.state;

    const nicename = this.getNicename('csv');
    const filteredData = this.filterDataAfterTime(data, fromTime);

    let dropColumns = ['seriesIndex'];
    if (!isCloudCoverageDataAvailable) {
      dropColumns.push('cloudCoveragePercent');
    }

    const csv = constructCSVFromData(filteredData, dropColumns);

    FileSaver.saveAs(new Blob([csv]), nicename);
  };

  getNicename = (extension) => {
    const { datasetId, layerId, customSelected } = this.props;
    const { fromTime, toTime } = this.state;

    const name = `${getDatasetLabel(datasetId)}-${customSelected ? 'Custom' : layerId}-${fromTime.toISOString()}-${toTime.toISOString()}`;
    return `${sanitizeFilenameSegment(name)}.${extension}`;
  };

  filterDataAfterTime = (data, fromTime) => {
    const filteredData = {};
    for (let band of data) {
      filteredData[band.title] = band.coordinates.filter((v) => moment(v.date).isSameOrAfter(fromTime));
    }
    return filteredData;
  };

  onDataReceived(fromTime, toTime, responseData, lastChannelIsCloudCoverage) {
    // merge newly received data with existing:
    const lastChannelId =
      Object.keys(responseData).length > 1 ? `C${Object.keys(responseData).length - 1}` : null;
    for (let channelId in responseData) {
      // exception: if there are 2 channels then channel 'C1' is really cloud coverage info:
      if (lastChannelIsCloudCoverage && channelId === lastChannelId) {
        this.availableData.cloudCoverageData.push(...responseData[channelId]);
      } else {
        this.availableData.data[channelId] = this.availableData.data[channelId] || [];
        this.availableData.data[channelId].push(...responseData[channelId]);
      }
    }

    this.availableData.fromTime = fromTime;
    this.availableData.toTime = moment.max(toTime, this.availableData.toTime);
    // update state to trigger chart rendering:
    this.updateStateWithData();
  }

  updateStateWithData() {
    const { data: responseData } = this.availableData;

    const drawDistribution = this.shouldDrawDistribution();
    const isCloudCoverageDataAvailable = this.availableData.cloudCoverageData.length > 0;
    const cloudCoveragePerDays = this.availableData.cloudCoverageData.reduce((partialResult, v) => {
      partialResult[v.date] = v.basicStats.mean;
      return partialResult;
    }, {});

    // we need to pre-process data as expected by chart lib:
    let lineData = [];
    let seriesIndex = 0; // remember the channel key in each point - you will need it later to colorize the series data
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let channelId in responseData) {
      const validStats = responseData[channelId].filter(
        (stat) =>
          stat.basicStats.mean !== 'NaN' &&
          !String(stat.basicStats.min).includes('Infinity') &&
          !String(stat.basicStats.max).includes('Infinity') &&
          (!drawDistribution || stat.histogram.bins.length === 10) &&
          (!isCloudCoverageDataAvailable || cloudCoveragePerDays[stat.date] <= this.maxCCAllowed),
      );

      // prettier-ignore
      const currentLineData = {
        title: channelId,
        coordinates: validStats.map((stat) => ({  // eslint-disable-line no-loop-func
          date: stat.date,
          seriesIndex,
          ...stat.basicStats,
          median: drawDistribution ? stat.histogram.bins[5].lowEdge : null,
          p10: drawDistribution ? stat.histogram.bins[1].lowEdge : null,
          p90: drawDistribution ? stat.histogram.bins[9].lowEdge : null,
          cloudCoveragePercent: isCloudCoverageDataAvailable ? cloudCoveragePerDays[stat.date] * 100 : null
        }))
      }

      if (currentLineData.coordinates.length > 0) {
        lineData.push(currentLineData);
      }

      // update min and max value:
      minY = Math.min(
        minY,
        validStats.reduce(
          (prevValue, stat) => Math.min(prevValue, stat.basicStats.min),
          Number.POSITIVE_INFINITY,
        ),
      );
      maxY = Math.max(
        maxY,
        validStats.reduce(
          (prevValue, stat) => Math.max(prevValue, stat.basicStats.max),
          Number.NEGATIVE_INFINITY,
        ),
      );

      seriesIndex += 1;
    }

    this.setState({
      lineData,
      minY: Math.floor(minY * 100) / 100,
      maxY: Math.ceil(maxY * 100) / 100,
      dataAvailableFromTime: this.availableData.fromTime,
      isCloudCoverageDataAvailable,
      maxCCAllowed: this.maxCCAllowed,
      fetchingInProgress: false,
    });
  }

  shouldDrawDistribution = () => {
    const { data: responseData } = this.availableData;
    const { visualizationUrl, customSelected, poiOrAoi } = this.props;
    if (poiOrAoi === 'poi') {
      return false;
    }
    if (customSelected) {
      return false;
    }
    // eocloud returns a different result, so we don't draw distribution:
    if (visualizationUrl.includes('://eocloud.sentinel-hub.com/')) {
      return false;
    }

    if (responseData['C0'] && responseData['C0'][0].histogram.bins.length !== 10) {
      return false;
    }

    return true;
  };

  renderFetching() {
    return (
      <div className="fetching">
        <i className="fa fa-cog fa-spin fa-3x fa-fw" />
        {t`Loading, please wait`}
      </div>
    );
  }

  renderIntervalButtons() {
    const { selectedTimeIntervalIndex } = this.state;
    return (
      <div className="interval-buttons">
        {this.TIME_INTERVALS.map((interval, index) => {
          return index === selectedTimeIntervalIndex ? (
            <EOBButton
              key={`interval-button-${index}`}
              text={interval.label}
              className="selected secondary"
            />
          ) : (
            <EOBButton
              key={`interval-button-${index}`}
              className="secondary"
              text={interval.label}
              onClick={() => {
                this.onIntervalChange(index);
              }}
            />
          );
        })}
      </div>
    );
  }

  renderChart(drawLegend) {
    const { lineData, fromTime, toTime, minY, maxY, dataAvailableFromTime, fetchingBatches, maxCCAllowed } =
      this.state;
    // Re-render the whole chart whenever any constraint changes - this key includes all the constraints:
    const chartDataKey = `${fromTime}-${dataAvailableFromTime}-${maxCCAllowed}`;
    const drawDistribution = this.shouldDrawDistribution();

    // recharts shares a single data array across all series, so merge the per-channel
    // coordinates into one array keyed by date:
    const pointsByDate = {};
    lineData.forEach((serie) => {
      const channelId = serie.title;
      serie.coordinates
        .filter((v) => moment(v.date).isSameOrAfter(fromTime))
        .forEach((coordinate) => {
          const dateMs = +moment(coordinate.date);
          if (!pointsByDate[dateMs]) {
            pointsByDate[dateMs] = { date: dateMs };
          }
          pointsByDate[dateMs][`mean__${channelId}`] = coordinate.mean;
          pointsByDate[dateMs][`band__${channelId}`] =
            drawDistribution && coordinate.p10 != null && coordinate.p90 != null
              ? [coordinate.p10, coordinate.p90]
              : null;
          pointsByDate[dateMs][`point__${channelId}`] = coordinate;
        });
    });
    const chartData = Object.values(pointsByDate).sort((a, b) => a.date - b.date);

    // Pre-compute evenly spaced x-axis ticks across the whole selected time range, so all
    // date labels are shown up front regardless of how much data has loaded so far:
    const fromMs = +moment(fromTime);
    const toMs = +moment(toTime);
    const X_TICK_COUNT = 5;
    const xTicks = Array.from({ length: X_TICK_COUNT }, (_, i) =>
      Math.round(fromMs + ((toMs - fromMs) * i) / (X_TICK_COUNT - 1)),
    );

    return (
      <div>
        {lineData.length === 0 ? (
          <span>{t`No data found`}</span>
        ) : (
          <div style={{ position: 'relative' }}>
            <ComposedChart
              key={chartDataKey}
              width={650}
              height={320}
              data={chartData}
              margin={{ top: 10, right: 30, bottom: 30, left: 10 }}
            >
              <CartesianGrid strokeDasharray="5 5" stroke={styleVariables.chartGridColor} />
              <XAxis
                type="number"
                dataKey="date"
                domain={[fromMs, toMs]}
                ticks={xTicks}
                interval={0}
                allowDataOverflow={true}
                tickFormatter={(d) => moment(d).format('D. MMM YY')}
                stroke={styleVariables.textColor}
                tick={{ fill: styleVariables.textColor }}
                tickMargin={10}
              />
              <YAxis
                domain={[minY, maxY]}
                stroke={styleVariables.textColor}
                tick={{ fill: styleVariables.textColor }}
                tickMargin={10}
              />
              <Tooltip content={this.renderTooltip} isAnimationActive={false} />
              {lineData.map((serie, index) => {
                const color = chooseChartSeriesColor(index, lineData.length);
                return (
                  <Area
                    key={`area-${serie.title}`}
                    dataKey={`band__${serie.title}`}
                    stroke="none"
                    fill={color}
                    fillOpacity={0.15}
                    connectNulls
                    activeDot={false}
                    isAnimationActive={false}
                  />
                );
              })}
              {lineData.map((serie, index) => {
                const color = chooseChartSeriesColor(index, lineData.length);
                return (
                  <Line
                    key={`line-${serie.title}`}
                    type="linear"
                    dataKey={`mean__${serie.title}`}
                    stroke={color}
                    dot={{ r: 2, fill: color, stroke: color }}
                    activeDot={{ r: 3, fill: styleVariables.primaryColor, stroke: 'none' }}
                    connectNulls
                    isAnimationActive={false}
                  />
                );
              })}
            </ComposedChart>
            {fetchingBatches && (
              <div className="fetching-small" style={{ position: 'absolute' }}>
                <i className="fa fa-cog fa-spin fa-3x fa-fw" />
              </div>
            )}
          </div>
        )}

        {drawLegend && (
          <div>
            <svg width={600} height={30} className="legend">
              {/* The chart legend only supports vertical placing of elements, so we construct our own SVG: */}
              {lineData.map((serie, index) => {
                const DIST_HORIZ = 50;
                const DIST_VERT = 20;
                return (
                  <g
                    key={`legendpart-${index}`}
                    transform={`translate(${(DIST_HORIZ * index) % 600}, ${
                      Math.floor((DIST_HORIZ * index) / 600) * DIST_VERT
                    })`}
                  >
                    <rect
                      x={0}
                      y={0}
                      width={10}
                      height={10}
                      rx={2}
                      ry={2}
                      fill={chooseChartSeriesColor(index, lineData.length)}
                    />
                    <text x={20} y={10}>
                      {serie.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    );
  }

  renderTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    const row = payload[0].payload;
    const { lineData } = this.state;
    return (
      <div className="fis-tooltip">
        <div>{moment(row.date).format('ddd, DD. MMM YYYY')}</div>
        {lineData.map((serie, index) => {
          const dataPoint = row[`point__${serie.title}`];
          if (!dataPoint) {
            return null;
          }
          return (
            <div key={`tooltip-${serie.title}`}>
              {lineData.length > 1 && (
                <div className="series-label">
                  <span
                    className="series-color"
                    style={{ backgroundColor: chooseChartSeriesColor(index, lineData.length) }}
                  />
                  {serie.title}
                </div>
              )}
              {this.getTooltipContent(dataPoint)}
            </div>
          );
        })}
      </div>
    );
  };

  getTooltipContent(dataPoint) {
    return (
      <div>
        <ul>
          <li>
            {t`mean`}: {dataPoint.mean.toFixed(2)}
          </li>
          <li>
            P<sub>10</sub> - P<sub>90</sub>: {dataPoint.p10 ? dataPoint.p10.toFixed(2) : '/'}
            {' - '}
            {dataPoint.p90 ? dataPoint.p90.toFixed(2) : '/'}
          </li>
        </ul>

        <div>
          <hr />
          <ul>
            <li>
              {t`median`}: {dataPoint.median ? dataPoint.median.toFixed(2) : '/'}
            </li>
            <li>
              {' '}
              {t`st. dev.`}: {dataPoint.stDev ? dataPoint.stDev.toFixed(2) : '/'}
            </li>
            <li>
              {t`min / max`}: {dataPoint.min ? dataPoint.min.toFixed(2) : '/'} {' - '}
              {dataPoint.max ? dataPoint.max.toFixed(2) : '/'}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderErrorMessage = () => {
    const { errorMsg, fromTime, toTime } = this.state;
    return (
      <div className="error-container">
        <div className="error-message">{errorMsg}</div>
        <EOBButton text={t`Retry`} icon="refresh" onClick={() => this.fetchFISData(fromTime, toTime)} />
      </div>
    );
  };

  renderCCSlider = () => {
    const { customSelected } = this.props;
    const { maxCCAllowed, isCloudCoverageDataAvailable } = this.state;

    if (!isCloudCoverageDataAvailable) {
      return null;
    }

    return (
      <div className="ccslider">
        <EOBCCSlider
          onChange={this.setMaxCCAllowed}
          cloudCoverPercentage={Math.round(maxCCAllowed * 100)}
          sliderWidth={100}
        />
        {customSelected && (
          <div className="last-band-msg">{t`Based on the last band of the custom script.`}</div>
        )}
      </div>
    );
  };

  render() {
    const { fetchingInProgress, fetchingBatches, lineData, errorMsg } = this.state;
    const { datasetId, layerName } = this.props;

    const drawLegend = lineData && lineData.length > 1;
    return (
      <DraggableDialogBox
        className="fis"
        width={700}
        height={520 + (drawLegend ? 30 : 0)}
        onClose={this.onClose}
        title={`${getDatasetLabel(datasetId)} - ${layerName}`}
        modal={true}
      >
        {this.renderCCSlider()}

        <div className="fis-content">
          {fetchingInProgress ? (
            this.renderFetching()
          ) : (
            <div>
              {this.renderIntervalButtons()}

              {errorMsg ? this.renderErrorMessage() : this.renderChart(drawLegend)}
            </div>
          )}
        </div>
        {!fetchingInProgress && !fetchingBatches && !errorMsg && lineData.length > 0 && (
          <EOBButton
            text={t`Export CSV`}
            icon="download"
            className="export-csv-button"
            onClick={this.exportCSV}
          />
        )}
      </DraggableDialogBox>
    );
  }
}

const mapStoreToProps = (store) => ({
  layerId: store.visualization.layerId,
  datasetId: store.visualization.datasetId,
  visualizationUrl: store.visualization.visualizationUrl,
  evalscript: store.visualization.evalscript,
  customSelected: store.visualization.customSelected,
  toTime: store.visualization.toTime,
  aoiGeometry: store.aoi.geometry,
  poiGeometry: store.poi.geometry,
  poiOrAoi: store.modal.params ? store.modal.params.poiOrAoi : null,
  layerName: store.modal.params?.layerName,
});

export default connect(mapStoreToProps, null)(FIS);

function chooseChartSeriesColor(lineIndex, countTotal = 3) {
  switch (lineIndex) {
    case 0:
      return countTotal === 1 ? styleVariables.primaryColor : '#ee0000';
    case 1:
      return '#00ee00';
    case 2:
      return '#0000ee';
    default:
      // note: charting libs can have problems if saturation & level are set to 100%
      let hue = 30 + lineIndex * 60;
      return `hsl(${hue}, 70%, 70%)`;
  }
}
