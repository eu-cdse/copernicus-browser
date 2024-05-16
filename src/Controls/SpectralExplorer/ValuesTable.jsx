import { t } from 'ttag';

const TableRow = ({ id, items }) => (
  <tr>
    {items.map((item, index) => (
      <td key={`${id}-${index}`}>{item}</td>
    ))}
  </tr>
);

const ValuesTable = ({ series = [], bands = [], selected = [] }) => {
  const displayedSeries = series?.filter((s) => selected.find((sel) => sel === s.id)) ?? [];
  const headerItems = ['', ...displayedSeries.map((s) => s.title)];

  return (
    <div className="values-table">
      <table>
        <thead>
          <tr>
            {headerItems.map((item, index) => (
              <th key={`header-${index}`}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bands?.map(({ name }) => {
            const bandValues = displayedSeries.map((s) => {
              const seriesItem = s.coordinates.find((c) => c.name === name);
              const formattedValue =
                seriesItem && seriesItem.value !== undefined ? seriesItem.value.toFixed(4) : t`N/A`;
              return formattedValue;
            });
            return <TableRow key={name} id={name} items={[name, ...bandValues]} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ValuesTable;
