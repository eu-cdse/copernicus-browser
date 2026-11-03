export const RRD_SEARCH_PAYLOAD_1 = {
  type: 'FeatureCollection',
  features: [],
  numberReturned: 0,
  message: '',
  error: 'false',
};

export const RRD_SEARCH_PAYLOAD_2 = {
  status: 400,
  title: 'Research CCME: Settings.Optical.MaxCloudCover=The field MaxCloudCover must be between 0 and 100. ',
  type: 'FeatureCollection',
  features: [],
  numberReturned: 0,
  error: 'true',
  message:
    'Research CCME: Settings.Optical.MaxCloudCover=The field MaxCloudCover must be between 0 and 100. ',
};

export const RRD_SEARCH_PAYLOAD_3 = {
  status: 400,
  title: 'Bad Request',
  type: 'FeatureCollection',
  features: [],
  numberReturned: 0,
  error: 'true',
  message:
    'Research Feasibility: Error calling feasibility request. Status code: 400, Reason: Bad Request.\nBody:\n{"non_field_errors":["End time must be less than 7 days from now, if given."]}\n',
};

export const RRD_SEARCH_PAYLOAD_4 = {
  status: 400,
  title: 'Bad Request',
  type: 'FeatureCollection',
  features: [],
  numberReturned: 0,
  error: 'true',
  message:
    'Research Feasibility: Get feasibility request is failed. Status code: 404, Reason: .\nBody:\n{"apiVersion":"1.1.1","timestamp":"2026-10-09T08:11:47.272774411","errors":[{"code":404,"reason":"Not Found","message":"No theoretical opportunities found with informed data"}]}\n',
};

export const RRD_SEARCH_PAYLOAD_5 = {
  status: 500,
  title: 'Provider search errors',
  type: 'FeatureCollection',
  features: [],
  numberReturned: 0,
  error: 'true',
  message: 'Research CCME: planetscope: The remote server returned an error: (429) Too Many Requests.',
};

export const RRD_SEARCH_PAYLOAD_6 = {
  type: 'FeatureCollection',
  features: [],
  numberReturned: 0,
  message:
    "TASKING COMMENTS : \"Detailed list of failed parameter validations follows:\\nProvider's mission '10' requires parameter instrumentMode\\nCombination of parameters Mission, InstrumentMode, ResolutionClass, Polarization, ProductType and ProducTypeMultiLookOption is not supported by the provider for mission 10\\n\"\n",
  error: 'false',
};
