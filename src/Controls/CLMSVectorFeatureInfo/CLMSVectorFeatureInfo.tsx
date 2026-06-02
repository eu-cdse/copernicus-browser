import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import { modalSlice } from '../../store';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { DraggableDialogBox } from '../../components/DraggableDialogBox/DraggableDialogBox';
import { getDatasetLabel } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { fetchWmsGetFeatureInfo, FeatureAttributes } from './CLMSVectorFeatureInfo.utils';
import './CLMSVectorFeatureInfo.scss';

const getFieldLabels = (): Record<string, string> => ({
  class_2021: t`Class 2021`,
  class_2018: t`Class 2018`,
  code_2021: t`Code 2021`,
  code_2018: t`Code 2018`,
  country: t`Country`,
  fua_name: t`Urban area`,
  fua_code: t`FUA code`,
  STL: t`Street tree layer`,
  identifier: t`Identifier`,
  area: t`Area (m²)`,
  perimeter: t`Perimeter (m)`,
  prod_date: t`Production date`,
  comment: t`Comment`,
});

const formatValue = (key: string, value: string | number | null | undefined): string => {
  if (value === '' || value === null || value === undefined) {
    return '—';
  }
  if (key === 'area' || key === 'perimeter') {
    return Math.round(Number(value)).toLocaleString();
  }
  return String(value);
};

type CLMSGFIModalParams = { datasetId: string; lat: number; lng: number };

const CLMSVectorFeatureInfo = () => {
  const dispatch = useAppDispatch();
  const params = useAppSelector((state) => state.modal.params as CLMSGFIModalParams | null);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState<FeatureAttributes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAttributes(null);
    fetchWmsGetFeatureInfo({
      datasetId: params.datasetId,
      lat: params.lat,
      lng: params.lng,
    })
      .then((result) => {
        if (!cancelled) {
          setAttributes(result);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('GetFeatureInfo request failed', err);
          setError(t`Failed to load feature info.`);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (!params) {
    return null;
  }

  const { datasetId } = params;

  const onClose = () => {
    dispatch(modalSlice.actions.removeModal());
  };

  const title = getDatasetLabel(datasetId) || t`Feature info`;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="clms-gfi-status">
          <i className="fa fa-spinner fa-spin fa-fw" />
        </div>
      );
    }
    if (error) {
      return <div className="clms-gfi-status clms-gfi-error">{error}</div>;
    }
    if (!attributes) {
      return <div className="clms-gfi-status">{t`No feature at this location.`}</div>;
    }
    const fieldLabels = getFieldLabels();
    const rows = Object.entries(attributes).map(([key, value]) => ({
      key,
      label: fieldLabels[key] || key,
      formatted: formatValue(key, value),
    }));

    return (
      <table className="clms-gfi-table">
        <tbody>
          {rows.map(({ key, label, formatted }) => (
            <tr key={key}>
              <th>{label}</th>
              <td>{formatted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <DraggableDialogBox
      className="clms-gfi-dialog"
      title={title}
      width={520}
      height={400}
      onClose={onClose}
      modal={true}
    >
      <div className="clms-gfi-content">{renderContent()}</div>
    </DraggableDialogBox>
  );
};

export default CLMSVectorFeatureInfo;
