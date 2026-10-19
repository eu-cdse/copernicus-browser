// Generated file – do not edit manually.
// Regenerate with `npm run update-mapserver-capabilities-cache`.
export const MAPSERVER_WMS_CAPABILITIES_XML = `<?xml version='1.0' encoding="UTF-8" standalone="no" ?>
<WMS_Capabilities version="1.3.0"  xmlns="http://www.opengis.net/wms"   xmlns:sld="http://www.opengis.net/sld"   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"   xmlns:ms="http://mapserver.gis.umn.edu/mapserver"   xmlns:inspire_common="http://inspire.ec.europa.eu/schemas/common/1.0"   xmlns:inspire_vs="http://inspire.ec.europa.eu/schemas/inspire_vs/1.0"   xsi:schemaLocation="http://www.opengis.net/wms http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd  http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd  http://inspire.ec.europa.eu/schemas/inspire_vs/1.0  https://inspire.ec.europa.eu/schemas/inspire_vs/1.0/inspire_vs.xsd http://mapserver.gis.umn.edu/mapserver https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;service=WMS&amp;version=1.3.0&amp;request=GetSchemaExtension">
<Service>
  <Name>WMS</Name>
  <Title>Urban Atlas Web Map Service</Title>
  <Abstract>Urban Atlas service based on 2018 and 2021 surveys with additional raster overviews</Abstract>
  <KeywordList>
      <Keyword>Urban Atlas</Keyword>
      <Keyword>Land Cover</Keyword>
      <Keyword>Land Use</Keyword>
      <Keyword>Copernicus</Keyword>
      <Keyword>CLMS</Keyword>
      <Keyword vocabulary="GEMET - INSPIRE themes">Land use</Keyword>
      <Keyword vocabulary="GEMET - INSPIRE themes">Land cover</Keyword>
  </KeywordList>
  <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/>
  <ContactInformation>
    <ContactPersonPrimary>
      <ContactPerson>CLMS Service Desk</ContactPerson>
      <ContactOrganization>European Environment Agency</ContactOrganization>
    </ContactPersonPrimary>
  <ContactElectronicMailAddress>copernicus@eea.europa.eu</ContactElectronicMailAddress>
  </ContactInformation>
  <Fees>no conditions apply</Fees>
  <AccessConstraints>Data provided under Copernicus data policy. Attribution required: © European Union, Copernicus Land Monitoring Service, European Environment Agency (EEA).</AccessConstraints>
  <MaxWidth>4096</MaxWidth>
  <MaxHeight>4096</MaxHeight>
</Service>

<Capability>
  <Request>
    <GetCapabilities>
      <Format>text/xml</Format>
      <DCPType>
        <HTTP>
          <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Get>
          <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Post>
        </HTTP>
      </DCPType>
    </GetCapabilities>
    <GetMap>
      <Format>image/png</Format>
      <Format>image/jpeg</Format>
      <Format>image/png; mode=8bit</Format>
      <Format>image/vnd.jpeg-png</Format>
      <Format>image/vnd.jpeg-png8</Format>
      <Format>application/x-pdf</Format>
      <Format>image/svg+xml</Format>
      <Format>image/tiff</Format>
      <Format>application/vnd.google-earth.kml+xml</Format>
      <Format>application/vnd.google-earth.kmz</Format>
      <Format>application/vnd.mapbox-vector-tile</Format>
      <Format>application/x-protobuf</Format>
      <Format>application/json</Format>
      <DCPType>
        <HTTP>
          <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Get>
          <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Post>
        </HTTP>
      </DCPType>
    </GetMap>
    <GetFeatureInfo>
      <Format>text/html</Format>
      <Format>text/plain</Format>
      <Format>geojson</Format>
      <Format>application/vnd.ogc.gml</Format>
      <DCPType>
        <HTTP>
          <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Get>
          <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Post>
        </HTTP>
      </DCPType>
    </GetFeatureInfo>
    <sld:DescribeLayer>
      <Format>text/xml</Format>
      <DCPType>
        <HTTP>
          <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Get>
          <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Post>
        </HTTP>
      </DCPType>
    </sld:DescribeLayer>
    <sld:GetLegendGraphic>
      <Format>image/png</Format>
      <Format>image/jpeg</Format>
      <Format>image/png; mode=8bit</Format>
      <Format>image/vnd.jpeg-png</Format>
      <Format>image/vnd.jpeg-png8</Format>
      <DCPType>
        <HTTP>
          <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Get>
          <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Post>
        </HTTP>
      </DCPType>
    </sld:GetLegendGraphic>
    <ms:GetStyles>
      <Format>text/xml</Format>
      <DCPType>
        <HTTP>
          <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Get>
          <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;"/></Post>
        </HTTP>
      </DCPType>
    </ms:GetStyles>
  </Request>
  <Exception>
    <Format>XML</Format>
    <Format>INIMAGE</Format>
    <Format>BLANK</Format>
  </Exception>
  <sld:UserDefinedSymbolization SupportSLD="1" UserLayer="0" UserStyle="1" RemoteWFS="0" InlineFeature="0" RemoteWCS="0"/>
  <inspire_vs:ExtendedCapabilities>
    <inspire_common:MetadataUrl xsi:type="inspire_common:resourceLocatorType">
      <inspire_common:URL>https://sdi.eea.europa.eu/catalogue/srv/eng/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=05ae1e-YOUR-INSTANCEID-HERE&amp;outputSchema=http://www.isotc211.org/2005/gmd&amp;elementSetName=full</inspire_common:URL>
      <inspire_common:MediaType>application/xml</inspire_common:MediaType>
    </inspire_common:MetadataUrl>
    <inspire_common:SupportedLanguages>
      <inspire_common:DefaultLanguage><inspire_common:Language>eng</inspire_common:Language></inspire_common:DefaultLanguage>
    </inspire_common:SupportedLanguages>
    <inspire_common:ResponseLanguage><inspire_common:Language>eng</inspire_common:Language></inspire_common:ResponseLanguage>
  </inspire_vs:ExtendedCapabilities>
  <Layer queryable="1">
    <Name>Urban_Atlas_WMS</Name>
    <Title>Urban Atlas Web Map Service</Title>
    <Abstract>Urban Atlas service based on 2018 and 2021 surveys with additional raster overviews</Abstract>
    <KeywordList>
        <Keyword>Urban Atlas</Keyword>
        <Keyword>Land Cover</Keyword>
        <Keyword>Land Use</Keyword>
        <Keyword>Copernicus</Keyword>
        <Keyword>CLMS</Keyword>
        <Keyword vocabulary="GEMET - INSPIRE themes">Land use</Keyword>
        <Keyword vocabulary="GEMET - INSPIRE themes">Land cover</Keyword>
    </KeywordList>
    <CRS>EPSG:3035</CRS>
    <CRS>EPSG:3857</CRS>
    <CRS>EPSG:4326</CRS>
    <CRS>EPSG:4258</CRS>
    <CRS>EPSG:3044</CRS>
    <CRS>EPSG:3045</CRS>
    <CRS>EPSG:3046</CRS>
    <CRS>EPSG:32631</CRS>
    <CRS>EPSG:32632</CRS>
    <CRS>EPSG:32633</CRS>
    <CRS>EPSG:32634</CRS>
    <CRS>EPSG:32635</CRS>
    <CRS>EPSG:32636</CRS>
    <CRS>EPSG:32637</CRS>
    <CRS>EPSG:32638</CRS>
    <EX_GeographicBoundingBox>
        <westBoundLongitude>-36.683498</westBoundLongitude>
        <eastBoundLongitude>75.433138</eastBoundLongitude>
        <southBoundLatitude>29.381887</southBoundLatitude>
        <northBoundLatitude>73.575375</northBoundLatitude>
    </EX_GeographicBoundingBox>
    <Attribution>
        <Title>Copernicus Land Monitoring Service — EEA</Title>
        <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://land.copernicus.eu/en/products/urban-atlas"/>
    </Attribution>
    <AuthorityURL name="EEA">
      <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://land.copernicus.eu"/>
    </AuthorityURL>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="541" height="1777">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=Urban_Atlas_WMS&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
    <Layer queryable="1">
      <Name>CLMS_UA_LCU_S2018_V025ha</Name>
      <Title>CLMS_UA_LCU_S2018_V025ha</Title>
      <Abstract>CLMS_UA_LCU_S2018_V025ha</Abstract>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="441" height="437">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=CLMS_UA_LCU_S2018_V025ha&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_LCU_2018_RASTER</Name>
        <Title>Urban Atlas Land Cover Land Use 2018 (Raster)</Title>
        <Abstract>Urban Atlas Land Cover Land Use 2018 (V025ha) - Raster overview</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-36.683498</westBoundLongitude>
            <eastBoundLongitude>75.433138</eastBoundLongitude>
            <southBoundLatitude>29.381887</southBoundLatitude>
            <northBoundLatitude>73.575375</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_LCU_2018_RASTER"/>
        </MetadataURL>
        <MinScaleDenominator>150000</MinScaleDenominator>
      </Layer>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_LCU_2018_VECTOR</Name>
        <Title>Urban Atlas Land Cover Land Use 2018 (Vector)</Title>
        <Abstract>Urban Atlas Land Cover Land Use 2018 (V025ha) - Vector tiles</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-77.587422</westBoundLongitude>
            <eastBoundLongitude>88.952715</eastBoundLongitude>
            <southBoundLatitude>-29.091886</southBoundLatitude>
            <northBoundLatitude>67.952405</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_LCU_2018_VECTOR"/>
        </MetadataURL>
        <Style>
          <Name>clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1_2018</Name>
          <Title>clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1_2018</Title>
          <LegendURL width="441" height="437">
             <Format>image/png</Format>
             <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=UA_LCU_2018_VECTOR&amp;format=image/png&amp;STYLE=clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1_2018"/>
          </LegendURL>
        </Style>
        <MaxScaleDenominator>150000</MaxScaleDenominator>
      </Layer>
    </Layer>
    <Layer queryable="1">
      <Name>CLMS_UA_LCU_S2021_V025ha</Name>
      <Title>CLMS_UA_LCU_S2021_V025ha</Title>
      <Abstract>CLMS_UA_LCU_S2021_V025ha</Abstract>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="541" height="509">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=CLMS_UA_LCU_S2021_V025ha&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_LCU_2021_RASTER</Name>
        <Title>Urban Atlas Land Cover Land Use 2021 (Raster)</Title>
        <Abstract>Urban Atlas Land Cover Land Use 2021 (V025ha) - Raster overview</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-36.683498</westBoundLongitude>
            <eastBoundLongitude>75.433138</eastBoundLongitude>
            <southBoundLatitude>29.381887</southBoundLatitude>
            <northBoundLatitude>73.575375</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_LCU_2021_RASTER"/>
        </MetadataURL>
        <MinScaleDenominator>150000</MinScaleDenominator>
      </Layer>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_LCU_2021_VECTOR</Name>
        <Title>Urban Atlas Land Cover Land Use 2021 (Vector)</Title>
        <Abstract>Urban Atlas Land Cover Land Use 2021 (V025ha) - Vector tiles</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-77.604950</westBoundLongitude>
            <eastBoundLongitude>88.952715</eastBoundLongitude>
            <southBoundLatitude>-29.152772</southBoundLatitude>
            <northBoundLatitude>67.952272</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_LCU_2021_VECTOR"/>
        </MetadataURL>
        <Style>
          <Name>clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1_2021</Name>
          <Title>clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1_2021</Title>
          <LegendURL width="541" height="509">
             <Format>image/png</Format>
             <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=UA_LCU_2021_VECTOR&amp;format=image/png&amp;STYLE=clms_ua_land-cover-land-use_europe_V025ha_3yearly_v1_2021"/>
          </LegendURL>
        </Style>
        <MaxScaleDenominator>150000</MaxScaleDenominator>
      </Layer>
    </Layer>
    <Layer queryable="1">
      <Name>CLMS_UA_LCUC_C2018-2021_V010ha</Name>
      <Title>CLMS_UA_LCUC_C2018-2021_V010ha</Title>
      <Abstract>CLMS_UA_LCUC_C2018-2021_V010ha</Abstract>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="541" height="509">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=CLMS_UA_LCUC_C2018-2021_V010ha&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_LCUC_2018-2021_RASTER</Name>
        <Title>Urban Atlas Land Cover Land Use Change 2018-2021 (Raster)</Title>
        <Abstract>Urban Atlas Land Cover Land Use Change 2018-2021 (V010ha) - Raster overview</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-36.683498</westBoundLongitude>
            <eastBoundLongitude>75.433138</eastBoundLongitude>
            <southBoundLatitude>29.381887</southBoundLatitude>
            <northBoundLatitude>73.575375</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_land-cover-land-use-change_europe_V010ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_LCUC_2018-2021_RASTER"/>
        </MetadataURL>
        <MinScaleDenominator>150000</MinScaleDenominator>
      </Layer>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_LCUC_2018-2021_VECTOR</Name>
        <Title>Urban Atlas Land Cover Land Use Change 2018-2021 (Vector)</Title>
        <Abstract>Urban Atlas Land Cover Land Use Change 2018-2021 (V010ha) - Vector tiles</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-77.418160</westBoundLongitude>
            <eastBoundLongitude>88.789588</eastBoundLongitude>
            <southBoundLatitude>-28.976867</southBoundLatitude>
            <northBoundLatitude>67.794464</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_land-cover-land-use-change_europe_V010ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_LCUC_2018-2021_VECTOR"/>
        </MetadataURL>
        <Style>
          <Name>clms_ua_land-cover-land-use-change_europe_V010ha_3yearly_v1_2018-2021</Name>
          <Title>clms_ua_land-cover-land-use-change_europe_V010ha_3yearly_v1_2018-2021</Title>
          <LegendURL width="541" height="509">
             <Format>image/png</Format>
             <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=UA_LCUC_2018-2021_VECTOR&amp;format=image/png&amp;STYLE=clms_ua_land-cover-land-use-change_europe_V010ha_3yearly_v1_2018-2021"/>
          </LegendURL>
        </Style>
        <MaxScaleDenominator>150000</MaxScaleDenominator>
      </Layer>
    </Layer>
    <Layer queryable="1">
      <Name>CLMS_UA_STL_S2021_V005ha</Name>
      <Title>CLMS_UA_STL_S2021_V005ha</Title>
      <Abstract>CLMS_UA_STL_S2021_V005ha</Abstract>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="146" height="23">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=CLMS_UA_STL_S2021_V005ha&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_STL_2021_RASTER</Name>
        <Title>Urban Atlas Street Tree Layer 2021 (Raster)</Title>
        <Abstract>Urban Atlas Street Tree Layer 2021 (V005ha) - Raster overview</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-36.683498</westBoundLongitude>
            <eastBoundLongitude>75.433138</eastBoundLongitude>
            <southBoundLatitude>29.381887</southBoundLatitude>
            <northBoundLatitude>73.575375</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_street-tree-layer_europe_V005ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_STL_2021_RASTER"/>
        </MetadataURL>
        <MinScaleDenominator>150000</MinScaleDenominator>
      </Layer>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>UA_STL_2021_VECTOR</Name>
        <Title>Urban Atlas Street Tree Layer 2021 (Vector)</Title>
        <Abstract>Urban Atlas Street Tree Layer 2021 (V005ha) - Vector tiles</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-77.550365</westBoundLongitude>
            <eastBoundLongitude>88.894898</eastBoundLongitude>
            <southBoundLatitude>-29.140019</southBoundLatitude>
            <northBoundLatitude>67.896952</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_ua_street-tree-layer_europe_V005ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=UA_STL_2021_VECTOR"/>
        </MetadataURL>
        <Style>
          <Name>clms_ua_street-tree-layer_europe_V005ha_3yearly_v1_stl</Name>
          <Title>clms_ua_street-tree-layer_europe_V005ha_3yearly_v1_stl</Title>
          <LegendURL width="146" height="23">
             <Format>image/png</Format>
             <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=UA_STL_2021_VECTOR&amp;format=image/png&amp;STYLE=clms_ua_street-tree-layer_europe_V005ha_3yearly_v1_stl"/>
          </LegendURL>
        </Style>
        <MaxScaleDenominator>150000</MaxScaleDenominator>
      </Layer>
    </Layer>
    <Layer queryable="1">
      <Name>CLMS_PA-LCU_S2021_V05ha</Name>
      <Title>CLMS_PA-LCU_S2021_V05ha</Title>
      <Abstract>CLMS_PA-LCU_S2021_V05ha</Abstract>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="288" height="162">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=CLMS_PA-LCU_S2021_V05ha&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>PA_LCU_2021_RASTER</Name>
        <Title>Protected Areas Land Cover/Land Use 2021 (Raster overview)</Title>
        <Abstract>CLMS Protected Areas Land Cover/Land Use 2021 (V05ha) - 75 m RGBA COG overview</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-53.382055</westBoundLongitude>
            <eastBoundLongitude>58.066547</eastBoundLongitude>
            <southBoundLatitude>24.801498</southBoundLatitude>
            <northBoundLatitude>70.832163</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_pa_land-cover-land-use_europe_V05ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=PA_LCU_2021_RASTER"/>
        </MetadataURL>
        <MinScaleDenominator>100000</MinScaleDenominator>
      </Layer>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>PA_LCU_2021_VECTOR</Name>
        <Title>Protected Areas Land Cover/Land Use 2021 (Vector)</Title>
        <Abstract>CLMS Protected Areas Land Cover/Land Use 2021 (V05ha) - FlatGeobuf delivery-unit tiles</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-53.381892</westBoundLongitude>
            <eastBoundLongitude>58.065521</eastBoundLongitude>
            <southBoundLatitude>24.802103</southBoundLatitude>
            <northBoundLatitude>70.832160</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_pa_land-cover-land-use_europe_V05ha_3yearly_v1</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=PA_LCU_2021_VECTOR"/>
        </MetadataURL>
        <Style>
          <Name>clms-pa-lcu-2021-level1</Name>
          <Title>clms-pa-lcu-2021-level1</Title>
          <LegendURL width="288" height="162">
             <Format>image/png</Format>
             <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=PA_LCU_2021_VECTOR&amp;format=image/png&amp;STYLE=clms-pa-lcu-2021-level1"/>
          </LegendURL>
        </Style>
        <MaxScaleDenominator>100000</MaxScaleDenominator>
      </Layer>
    </Layer>
    <Layer queryable="1">
      <Name>PROTECTED_AREAS_N2K_2012</Name>
      <Title>PROTECTED_AREAS_N2K_2012</Title>
      <Abstract>PROTECTED_AREAS_N2K_2012</Abstract>
    <Style>
       <Name>default</Name>
       <Title>default</Title>
       <LegendURL width="288" height="162">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=PROTECTED_AREAS_N2K_2012&amp;format=image/png&amp;STYLE=default"/>
       </LegendURL>
    </Style>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>PA_N2K_2012_RASTER</Name>
        <Title>Protected Areas N2K 2012 (Raster overview)</Title>
        <Abstract>Protected Areas N2K 2012 - 75 m RGBA COG overview</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-39.770743</westBoundLongitude>
            <eastBoundLongitude>52.271582</eastBoundLongitude>
            <southBoundLatitude>27.572554</southBoundLatitude>
            <northBoundLatitude>67.354618</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_protected-areas_n2k_2012</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=PA_N2K_2012_RASTER"/>
        </MetadataURL>
        <MinScaleDenominator>100000</MinScaleDenominator>
      </Layer>
      <Layer queryable="1" opaque="0" cascaded="0">
        <Name>protected_areas_fgb</Name>
        <Title>protected_areas_fgb</Title>
        <Abstract>Protected Areas N2K 2012 - FlatGeobuf vector layer</Abstract>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-39.770743</westBoundLongitude>
            <eastBoundLongitude>52.271582</eastBoundLongitude>
            <southBoundLatitude>27.572554</southBoundLatitude>
            <northBoundLatitude>67.354618</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Identifier authority="EEA">clms_protected-areas_n2k_2012</Identifier>
        <MetadataURL type="TC211">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;request=GetMetadata&amp;layer=protected_areas_fgb"/>
        </MetadataURL>
        <Style>
          <Name>clms-n2k-lclu-2012-level1</Name>
          <Title>clms-n2k-lclu-2012-level1</Title>
          <LegendURL width="288" height="162">
             <Format>image/png</Format>
             <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://mapserver.dataspace.copernicus.eu/ogc?language=eng&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=protected_areas_fgb&amp;format=image/png&amp;STYLE=clms-n2k-lclu-2012-level1"/>
          </LegendURL>
        </Style>
        <MaxScaleDenominator>100000</MaxScaleDenominator>
      </Layer>
    </Layer>
  </Layer>
</Capability>
</WMS_Capabilities>
`;
