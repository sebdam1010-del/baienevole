const Table = ({
  columns = [],
  data = [],
  className = '',
  responsive = true,
  ...props
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée à afficher
      </div>
    );
  }

  return (
    <div className={`${responsive ? 'overflow-x-auto' : ''} ${className}`}>
      <table className="min-w-full bg-white border rounded-lg" style={{ borderColor: 'var(--color-baie-beige)' }} {...props}>
        <thead style={{ backgroundColor: 'var(--color-baie-navy)' }}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-family-spartan)' }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ '--tw-divide-opacity': '1', borderColor: 'var(--color-baie-beige)' }}>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: 'var(--color-baie-navy)' }}
                >
                  {column.render
                    ? column.render(row[column.accessor], row, rowIndex)
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
