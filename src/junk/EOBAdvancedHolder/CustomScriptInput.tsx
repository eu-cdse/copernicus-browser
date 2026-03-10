import React, { useEffect, useRef, useState } from 'react';
import { t } from 'ttag';

import {
  CodeEditor,
  themeCdasBrowserDark,
  themeCdasBrowserLight,
} from '@sentinel-hub/evalscript-code-editor';

import CustomCheckbox from '../../components/CustomCheckbox/CustomCheckbox';
import { HTTPS, PROCESSING_OPTIONS } from '../../const';
import { fetchEvalscriptFromEvalscripturl, fetchProcessGraphFromProcessGraphUrl } from '../../utils';

import './CustomScriptInput.scss';

interface CustomScriptInputState {
  isEvalUrl: boolean;
  isProcessGraphUrl: boolean;
  scriptUrl: string;
  scriptContent: string;
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface CustomScriptInputProps {
  scriptUrl: string;
  scriptContent: string;
  isUrlMode: boolean;
  selectedProcessing: string;
  onChange: (state: CustomScriptInputState) => void;
  onRefreshEvalscript: (scriptContent: string, scriptUrl: string) => void;
  onRefreshOpenEO: (scriptContent: string) => void;
}

const CustomScriptInput = (props: CustomScriptInputProps) => {
  const { scriptUrl: propScriptUrl, scriptContent: propScriptContent, isUrlMode, selectedProcessing } = props;
  const initialIsOpenEO = selectedProcessing === PROCESSING_OPTIONS.OPENEO;

  const [state, setState] = useState<CustomScriptInputState>({
    isEvalUrl: isUrlMode && !initialIsOpenEO,
    isProcessGraphUrl: isUrlMode && initialIsOpenEO,
    scriptUrl: propScriptUrl,
    scriptContent: propScriptContent,
    loading: false,
    success: false,
    error: null,
  });

  const stateRef = useRef<CustomScriptInputState>(state);
  const prevScriptContentRef = useRef<string>(propScriptContent);

  const applyState = (patch: Partial<CustomScriptInputState>, notify: boolean = false): void => {
    const nextState = { ...stateRef.current, ...patch };
    stateRef.current = nextState;
    setState(nextState);
    if (notify) {
      props.onChange(nextState);
    }
  };

  useEffect(() => {
    const isOpenEO = selectedProcessing === PROCESSING_OPTIONS.OPENEO;
    const nextIsEvalUrl = isUrlMode && !isOpenEO;
    const nextIsProcessGraphUrl = isUrlMode && isOpenEO;

    const nextPatch: Partial<CustomScriptInputState> = {};
    if (stateRef.current.scriptContent !== propScriptContent) {
      nextPatch.scriptContent = propScriptContent;
    }
    if (stateRef.current.scriptUrl !== propScriptUrl) {
      nextPatch.scriptUrl = propScriptUrl;
    }
    if (stateRef.current.isEvalUrl !== nextIsEvalUrl) {
      nextPatch.isEvalUrl = nextIsEvalUrl;
    }
    if (stateRef.current.isProcessGraphUrl !== nextIsProcessGraphUrl) {
      nextPatch.isProcessGraphUrl = nextIsProcessGraphUrl;
    }

    if (Object.keys(nextPatch).length > 0) {
      applyState(nextPatch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propScriptContent, propScriptUrl, isUrlMode, selectedProcessing]);

  const updateCode = (scriptContent: string): void => {
    if (stateRef.current.scriptContent === scriptContent) {
      return;
    }
    applyState({ scriptContent }, true);
  };

  const selectEvalMode = (isEvalUrl: boolean): void => {
    applyState(
      {
        isEvalUrl,
        isProcessGraphUrl: false,
        scriptUrl: isEvalUrl ? stateRef.current.scriptUrl : '',
      },
      true,
    );
  };

  const selectProcessGraphMode = (isProcessGraphUrl: boolean): void => {
    applyState(
      {
        isProcessGraphUrl,
        isEvalUrl: false,
        scriptUrl: isProcessGraphUrl ? stateRef.current.scriptUrl : '',
      },
      true,
    );
  };

  const updateUrl = (e: React.ChangeEvent<HTMLInputElement>): void => {
    applyState({ scriptUrl: e.target.value }, true);
  };

  const loadCode = async (): Promise<void> => {
    const { loading, scriptUrl } = stateRef.current;
    const isOpenEO = selectedProcessing === PROCESSING_OPTIONS.OPENEO;

    if (loading) {
      return;
    }

    if (!scriptUrl || scriptUrl.trim() === '') {
      return;
    }

    if (scriptUrl.includes('http://')) {
      applyState({
        error: isOpenEO
          ? t`Error loading process graph. Check your URL.`
          : t`Error loading script. Check your URL.`,
      });
      setTimeout(() => applyState({ error: null }), 5000);
      return;
    }

    applyState({ loading: true, error: null });

    try {
      const fetchFunction = isOpenEO
        ? fetchProcessGraphFromProcessGraphUrl
        : fetchEvalscriptFromEvalscripturl;

      const res = await fetchFunction(scriptUrl);
      const { data: text } = res;
      const processedText = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;

      updateCode(processedText);
      applyState({ loading: false, success: true }, true);
      setTimeout(() => applyState({ success: false }), 2000);
    } catch (_error) {
      console.error(_error);
      applyState({
        loading: false,
        error: isOpenEO
          ? t`Error loading process graph. Check your URL.`
          : t`Error loading script. Check your URL.`,
      });
      setTimeout(() => applyState({ error: null }), 5000);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const { scriptUrl } = stateRef.current;
    if (!scriptUrl || scriptUrl.trim() === '') {
      return;
    }
    if (e.key === 'Enter') {
      loadCode();
    }
  };

  const refreshEvalscriptDisabled = (): boolean => {
    const { scriptContent, scriptUrl, isEvalUrl, isProcessGraphUrl } = stateRef.current;
    const currentIsUrlMode = isEvalUrl || isProcessGraphUrl;
    return (
      (currentIsUrlMode && !scriptUrl) ||
      (!currentIsUrlMode && !scriptContent) ||
      scriptContent === prevScriptContentRef.current
    );
  };

  const handleRefreshClick = (): void => {
    try {
      if (refreshEvalscriptDisabled()) {
        return;
      }

      props.onChange(stateRef.current);
      prevScriptContentRef.current = stateRef.current.scriptContent;

      const isOpenEO = selectedProcessing === PROCESSING_OPTIONS.OPENEO;
      if (isOpenEO) {
        props.onRefreshOpenEO(stateRef.current.scriptContent);
      } else {
        props.onRefreshEvalscript(stateRef.current.scriptContent, stateRef.current.scriptUrl);
      }
    } catch {
      applyState({
        error: t`Error fetching data`,
        loading: false,
      });
    }
  };

  const { error, loading, success, scriptContent, scriptUrl, isEvalUrl, isProcessGraphUrl } = state;
  const isOpenEO = selectedProcessing === PROCESSING_OPTIONS.OPENEO;
  const language = isOpenEO ? 'json' : 'javascript';
  const hasWarning = scriptUrl.length > 0 && !scriptUrl.startsWith(HTTPS);
  const currentIsUrlMode = isEvalUrl || isProcessGraphUrl;

  return (
    <div className="evalscript-input">
      <div className="code-editor-wrap">
        <CodeEditor
          themeDark={themeCdasBrowserDark}
          themeLight={themeCdasBrowserLight}
          defaultEditorTheme="light"
          value={scriptContent || ''}
          onChange={updateCode}
          isReadOnly={currentIsUrlMode}
          portalId="code_editor_portal"
          zIndex={9999}
          onRunEvalscriptClick={handleRefreshClick}
          runEvalscriptButtonText={t`Apply`}
          runningEvalscriptButtonText={t`Applying`}
          readOnlyMessage={
            isOpenEO
              ? t`Editor is in read only mode. Uncheck "Load process graph from URL" to edit the code`
              : t`Editor is in read only mode. Uncheck "Load script from URL" to edit the code`
          }
          language={language}
        />
      </div>

      <div className="evalscript-action-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="evalscript-action-load-url">
            {!isOpenEO && (
              <span className="checkbox-holder use-url">
                <CustomCheckbox
                  className={undefined}
                  inputClassName={undefined}
                  checked={isEvalUrl}
                  onChange={(e) => selectEvalMode(e.target.checked)}
                  label={t`Load script from URL`}
                  disabled={false}
                  disabledTitle={undefined}
                />
              </span>
            )}
            {isOpenEO && (
              <span className="checkbox-holder use-url">
                <CustomCheckbox
                  className={undefined}
                  inputClassName={undefined}
                  checked={isProcessGraphUrl}
                  onChange={(e) => selectProcessGraphMode(e.target.checked)}
                  label={t`Load process graph from URL`}
                  disabled={false}
                  disabledTitle={undefined}
                />
              </span>
            )}
          </div>
        </div>

        {currentIsUrlMode && (
          <div className="insert-url-block-wrapper">
            <div className="insert-url-block">
              <input
                placeholder={isOpenEO ? t`Enter URL to your process graph` : t`Enter URL to your script`}
                onKeyDown={onKeyDown}
                disabled={!currentIsUrlMode}
                value={scriptUrl}
                onChange={updateUrl}
                className={hasWarning ? 'warning' : ''}
              />
              {success || hasWarning ? (
                <i
                  title={
                    success
                      ? isOpenEO
                        ? t`Process graph loaded.`
                        : t`Script loaded.`
                      : t`Only HTTPS domains are allowed.`
                  }
                  className={`fa fa-${success ? 'check' : 'warning'}`}
                />
              ) : scriptUrl ? (
                // eslint-disable-next-line
                <a onClick={loadCode}>
                  <i
                    className={`fa fa-refresh ${loading ? 'fa-spin' : ''} valid`}
                    title={
                      isOpenEO ? t`Load process graph into code editor` : t`Load script into code editor`
                    }
                  />
                </a>
              ) : null}
            </div>
          </div>
        )}

        {currentIsUrlMode && (
          <div className="info-uncheck-url">
            <i className="fa fa-info" />
            {isOpenEO
              ? t`Uncheck Load process graph from URL to edit the code.`
              : t`Uncheck Load script from URL to edit the code.`}
          </div>
        )}

        {error && (
          <div className="notification">
            <i className="fa fa-warning" /> {error}
          </div>
        )}
      </div>

      <div className="script-button-panel ">
        <button onClick={handleRefreshClick} className="eob-btn" disabled={refreshEvalscriptDisabled()}>
          <i className="fa fa-refresh" />
          {t`Apply`}
        </button>
      </div>
    </div>
  );
};

export default CustomScriptInput;
