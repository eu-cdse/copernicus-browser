import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import Rodal from 'rodal';
import { t } from 'ttag';

import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import {
  parseContent,
  getFileExtension,
  loadFileContent,
  parseZip,
  UPLOAD_GEOMETRY_TYPE,
  checkIfValidShapeFile,
} from './EOBUploadGeoFile.utils';

import './EOBUploadGeoFile.scss';

const getFileUploadText = (fileUploadType) => {
  let fileUploadText;

  switch (fileUploadType) {
    case UPLOAD_GEOMETRY_TYPE.LINE:
      fileUploadText = t`Upload a KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file.`;
      break;
    default:
      fileUploadText = t`Upload a zipped file to create an area of interest. The area will be used for clipping when exporting an image.`;
  }

  return fileUploadText;
};

export class EOBUploadGeoFile extends Component {
  state = {
    error: null,
    inputGeometry: null,
  };

  onDrop = (ok, noOk) => {
    this.setState({ error: null });
    if (ok.length > 0) {
      this.setState({ allowedFiles: ok }, async () => {
        const file = ok[0];
        const format = getFileExtension(file.name);
        try {
          if (format !== 'zip') {
            const data = await loadFileContent(file, format);
            this.handleParseContent(data, this.props.type, format);
          } else {
            this.handleParseZip(file, this.props.type, format);
          }
        } catch (e) {
          this.setState({ error: e.message });
        }
      });
    }
  };

  handleParseContent = (content, type = UPLOAD_GEOMETRY_TYPE.POLYGON, format = null) => {
    try {
      let area = parseContent(content, type, format);
      this.props.onUpload(area);
    } catch (e) {
      this.setState({ error: `Error: ${e.message}` });
    }
  };

  handleParseZip = async (content, type = UPLOAD_GEOMETRY_TYPE.POLYGON, format = null) => {
    try {
      await checkIfValidShapeFile(content);

      let area = await parseZip(content, type);
      this.props.onUpload(area);
    } catch (e) {
      this.setState({ error: `Error: ${e.message}` });
    }
  };

  render() {
    const fileUploadTitle = t`File upload`;
    const fileUploadText = getFileUploadText(this.props.type);
    const dropAFileString = t`Drop a zipped SHP, KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file.`;
    const placeHolderText = t`Paste your GEOJSON geometry or enter a GEOREF/MGRS reference to define your area of interest.`;

    const { inputGeometry } = this.state;
    return ReactDOM.createPortal(
      <Rodal
        animation="slideUp"
        visible={true}
        customStyles={{
          width: 'auto',
          maxWidth: 400,
          height: 'auto',
          bottom: 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onClose={this.props.onClose}
        closeOnEsc={true}
      >
        <div className="fileUploadWindow">
          <h3>{fileUploadTitle}</h3>
          <p>{fileUploadText}</p>
          <Dropzone
            acceptClassName="ok"
            rejectClassName="false"
            className="fileUploadPanel"
            multiple={false}
            onDrop={this.onDrop}
          >
            {dropAFileString}
          </Dropzone>

          <div className="geometryInput">
            <textarea
              placeholder={placeHolderText}
              rows="12"
              defaultValue={inputGeometry}
              onChange={(e) => this.setState({ inputGeometry: e.target.value })}
            ></textarea>
          </div>
          <EOBButton
            text={t`Upload`}
            className="primary"
            fluid
            disabled={!inputGeometry}
            onClick={() => this.handleParseContent(inputGeometry, this.props.type, null)}
          />

          {this.state.error && <p className="error">{this.state.error}</p>}
        </div>
      </Rodal>,
      document.querySelector('#app'),
    );
  }
}
