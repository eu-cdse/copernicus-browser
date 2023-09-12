import React from 'react';
import paper from 'paper';

import { capToRange, computeNewValuesFromPaths, transformCurvePoints } from './CurveEditor.utils';

import './CurveEditor.scss';

export default class CurveEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: [],
    };
  }

  componentDidMount() {
    if (this.props.effect && this.props.effect.values) {
      this.setState({ values: this.props.effect.values });
    }

    this.preparePaperCanvas();
    this.addEventHandlersToCanvas();
    this.renderBackground();
    this.renderHistogram();
    this.renderBaseLine();

    if (this.props.effect && this.props.effect.points) {
      this.createPointsFromProps();
    } else {
      this.createNewPoints();
    }

    this.renderInteractiveLine();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.effect && this.props.effect && prevProps.effect.points !== this.props.effect.points) {
      this.createPointsFromProps();
      this.renderInteractiveLine();
    }

    if (
      prevProps.effect &&
      this.props.effect &&
      prevProps.effect.values !== this.props.effect.values &&
      !this.props.effect.values
    ) {
      this.setState({ values: [] });
    }
  }

  preparePaperCanvas() {
    this.canvas = this.refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.scope = new paper.PaperScope();
    this.scope.setup(this.canvas);

    this.bgLayer = new paper.Layer();
    this.histogramLayer = new paper.Layer();
    this.baseLineLayer = new paper.Layer();
    this.interactivePointsLayer = new paper.Layer();
    this.interactiveLineLayer = new paper.Layer();

    this.scope.project.addLayer(this.bgLayer);
    this.scope.project.addLayer(this.histogramLayer);
    this.scope.project.addLayer(this.baseLineLayer);
    this.scope.project.addLayer(this.interactivePointsLayer);
    this.scope.project.addLayer(this.interactiveLineLayer);
  }

  addEventHandlersToCanvas() {
    this.scope.view.onClick = (event) => {
      this.scope.activate();
      this.interactivePointsLayer.activate();

      const curvePoints = this.interactivePointsLayer
        .getItems({
          match: (p) => p.name && p.name.includes('curvePoint'),
        })
        .sort((a, b) => a.position.x - b.position.x);

      const DELTA = 30;
      const tooClosePoint = curvePoints.find((p) => Math.abs(p.position.x - event.point.x) <= DELTA);

      if (tooClosePoint) {
        tooClosePoint.position = event.point;
      } else {
        this.renderPoint(event.point);
      }

      this.renderInteractiveLine();
      this.computeAndSaveNewValues();
    };
  }

  renderBackground() {
    this.scope.activate();
    this.bgLayer.activate();
    this.bgRectPath = new paper.Path.Rectangle(0, 0, this.props.canvasSize, this.props.canvasSize);
    this.bgRectPath.fillColor = this.props.backgroundColor;
  }

  renderHistogram() {
    this.scope.activate();
    this.histogramLayer.activate();
    this.histogramLayer.removeChildren();

    const unitHeight = this.props.canvasSize / Math.max(...this.props.histogram);
    const unitWidth = this.props.canvasSize / this.props.histogram.length;

    this.props.histogram.forEach((v, i) => {
      // start x, start y, width, height of the column
      let path = new paper.Path.Rectangle(
        i * unitWidth,
        this.props.canvasSize - v * unitHeight,
        unitWidth,
        v * unitHeight,
      );
      path.fillColor = this.props.color;
      path.name = 'histogramBar_' + i;
    });
  }

  renderBaseLine() {
    this.scope.activate();
    this.baseLineLayer.activate();
    const fromPoint = new paper.Point(0, this.props.canvasSize);
    const toPoint = new paper.Point(this.props.canvasSize, 0);
    let path = new paper.Path.Line(fromPoint, toPoint);
    path.strokeColor = 'darkgray';
  }

  addEventHandlersToPoint(point) {
    point.onMouseEnter = () => this.scope.view.element.classList.add('on-point');
    point.onMouseLeave = () => this.scope.view.element.classList.remove('on-point');

    point.onMouseDrag = (event) => {
      point.position.x = capToRange(event.point.x, 0, this.props.canvasSize);
      point.position.y = capToRange(event.point.y, 0, this.props.canvasSize);

      const curvePoints = this.interactivePointsLayer
        .getItems({ match: (p) => p.name && p.name.includes('curvePoint') && p.id !== point.id })
        .sort((a, b) => a.position.x - b.position.x);

      const DELTA = 10;
      const tooClosePoint = curvePoints.find((p) => Math.abs(p.position.x - point.position.x) <= DELTA);

      if (tooClosePoint) {
        point.remove();
      }

      this.renderInteractiveLine();
    };

    point.onMouseUp = () => {
      // compute new values only on mouse up (when the movement is finished)
      this.computeAndSaveNewValues();
    };
  }

  renderPoint(point) {
    this.scope.activate();
    this.interactivePointsLayer.activate();
    let newPoint = new paper.Path.Circle(point, 5);
    newPoint.fillColor = 'black';
    newPoint.name = `curvePoint_${newPoint.id}`;
    this.addEventHandlersToPoint(newPoint);
  }

  createNewPoints() {
    this.renderPoint(new paper.Point(0, this.props.canvasSize));
    this.renderPoint(new paper.Point(this.props.canvasSize, 0));
  }

  createPointsFromProps() {
    this.scope.activate();
    this.interactivePointsLayer.activate();
    this.interactivePointsLayer.removeChildren();

    this.props.effect.points.forEach((p) => {
      const x = (p.x * this.props.canvasSize) / this.props.maxColorValue;
      const y = this.props.canvasSize - (p.y * this.props.canvasSize) / this.props.maxColorValue;
      this.renderPoint(new paper.Point(x, y));
    });
  }

  renderInteractiveLine() {
    this.scope.activate();
    this.interactiveLineLayer.activate();
    this.interactiveLineLayer.removeChildren();

    const curvePoints = this.interactivePointsLayer
      .getItems({ match: (p) => p.name && p.name.includes('curvePoint') })
      .sort((a, b) => a.position.x - b.position.x);
    const startPoint = curvePoints[0];
    const endPoint = curvePoints[curvePoints.length - 1];
    const innerPoints = curvePoints.filter((p) => p.id !== startPoint.id && p.id !== endPoint.id);

    // make a path to the startPoint, if it's not on the left edge
    let startPath = new paper.Path({ name: `curvePath_start`, strokeColor: 'black' });
    startPath.add(new paper.Point(-1, startPoint.position.y), new paper.Point(startPoint.position));

    // make a path from the endPoint onward, if it's not on the right edge
    let endPath = new paper.Path({ name: `curvePath_end`, strokeColor: 'black' });
    endPath.add(
      new paper.Point(endPoint.position),
      new paper.Point(this.props.canvasSize + 1, endPoint.position.y),
    );

    // make a path between startPoint and endPoint
    let innerPath = new paper.Path({ name: `curvePath_inner`, strokeColor: 'black' });
    innerPath.add(new paper.Point(startPoint.position), new paper.Point(endPoint.position));
    innerPoints.forEach((p) => {
      let index = innerPath.segments.findIndex((s) => s.point.x > p.position.x);
      innerPath.insert(index, new paper.Point(p.position));
    });
    innerPath.smooth({ type: 'catmull-rom', factor: 0.5 }); // 0.5 = no self-intersections
  }

  computeAndSaveNewValues() {
    const curvePoints = this.interactivePointsLayer
      .getItems({ match: (p) => p.name && p.name.includes('curvePoint') })
      .sort((a, b) => a.position.x - b.position.x);

    const startPath = this.interactiveLineLayer.getItem({
      match: (p) => p.name && p.name.includes('curvePath_start'),
    });
    const innerPath = this.interactiveLineLayer.getItem({
      match: (p) => p.name && p.name.includes('curvePath_inner'),
    });
    const endPath = this.interactiveLineLayer.getItem({
      match: (p) => p.name && p.name.includes('curvePath_end'),
    });
    const paths = { startPath, innerPath, endPath };

    const points = transformCurvePoints(curvePoints, this.props.canvasSize, this.props.maxColorValue);
    const values = computeNewValuesFromPaths(paths, this.props.canvasSize, this.props.maxColorValue);
    this.setState({ values: values }, () => this.props.updateCurveEffect({ points, values }));
  }

  render() {
    let inputColorGradString = 'rgb(0,0,0),';
    switch (this.props.color) {
      case 'red':
        inputColorGradString += 'rgb(255,0,0)';
        break;
      case 'green':
        inputColorGradString += 'rgb(0,255,0)';
        break;
      case 'blue':
        inputColorGradString += 'rgb(0,0,255)';
        break;
      default:
        inputColorGradString += 'rgb(0,0,0)';
    }

    let outputColorGradString = '';
    if (this.state.values.length === 0) {
      outputColorGradString = inputColorGradString;
    } else {
      for (let v of this.state.values) {
        const rgbValue = Math.round(v.y * 255);

        switch (this.props.color) {
          case 'red':
            outputColorGradString += 'rgb(' + rgbValue + ',0,0),';
            break;
          case 'green':
            outputColorGradString += 'rgb(0,' + rgbValue + ',0),';
            break;
          case 'blue':
            outputColorGradString += 'rgb(0,0,' + rgbValue + '),';
            break;
          default:
            outputColorGradString += 'rgb(0,0,0),';
        }
      }
      outputColorGradString = outputColorGradString.slice(0, -1);
    }

    return (
      <div className="curve-editor">
        <canvas
          ref="canvas"
          id={`${this.props.color}-canvas`}
          className="curve-editor-canvas"
          width={this.props.canvasSize}
          height={this.props.canvasSize}
        />
        <div
          style={{
            height: this.props.canvasSize,
            width: '20px',
            backgroundImage: `linear-gradient(to top, ${outputColorGradString})`,
            writingMode: 'vertical-lr',
            textOrientation: 'upright',
            textAlign: 'center',
          }}
        >
          output
        </div>

        <div
          style={{
            height: '20px',
            width: this.props.canvasSize,
            backgroundImage: `linear-gradient(to right, black, ${inputColorGradString})`,
            textAlign: 'center',
          }}
        >
          input
        </div>

        <div style={{ height: '20px', width: '20px' }}></div>
      </div>
    );
  }
}
