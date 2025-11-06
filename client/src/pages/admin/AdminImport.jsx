import { useState } from 'react';
import { Button, Card } from '../../components/ui';
import api from '../../services/api';

const AdminImport = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setErrors([{ message: 'Le fichier doit être au format CSV' }]);
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors([{ message: 'Le fichier ne doit pas dépasser 5 MB' }]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setSuccess('');
    setImportResult(null);

    // Read and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseCSVPreview(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSVPreview = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      setErrors([{ message: 'Le fichier CSV est vide' }]);
      return;
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim());

    // Parse first 10 rows for preview
    const rows = lines.slice(1, Math.min(11, lines.length)).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      header.forEach((key, i) => {
        row[key] = values[i] || '';
      });
      return { rowNumber: index + 2, data: row };
    });

    setPreview({ header, rows, totalRows: lines.length - 1 });
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setErrors([]);
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/events/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);
      setSuccess(`Import réussi ! ${response.data.imported} événement(s) importé(s).`);
      setFile(null);
      setPreview(null);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([{ message: err.response?.data?.error || 'Erreur lors de l\'import' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setErrors([]);
    setSuccess('');
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Import CSV d'événements
        </h1>
        <p className="text-gray-600 mt-2">
          Importez plusieurs événements à partir d'un fichier CSV
        </p>
      </div>

      {/* Format Instructions */}
      <Card>
        <h3
          className="text-lg mb-3"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Format du fichier CSV
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>Le fichier CSV doit contenir les colonnes suivantes (dans l'ordre) :</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>date</strong> : Format YYYY-MM-DD (ex: 2024-03-15)</li>
            <li><strong>nom</strong> : Nom de l'événement</li>
            <li><strong>horaireArrivee</strong> : Format HH:MM (ex: 14:30)</li>
            <li><strong>horaireDepart</strong> : Format HH:MM (ex: 18:00)</li>
            <li><strong>nombreBenevolesRequis</strong> : Nombre entier (ex: 5)</li>
            <li><strong>saison</strong> : Numéro de saison (1, 2, 3, ou 4)</li>
            <li><strong>nombreSpectatursAttendus</strong> : Nombre entier (optionnel)</li>
            <li><strong>description</strong> : Description de l'événement (optionnel)</li>
            <li><strong>commentaires</strong> : Commentaires additionnels (optionnel)</li>
          </ul>
        </div>
      </Card>

      {/* Success Message */}
      {success && (
        <div
          className="p-4 rounded border"
          style={{
            backgroundColor: '#D1FAE5',
            borderColor: 'var(--color-baie-green)',
            color: '#065F46',
          }}
        >
          {success}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card>
          <h3
            className="text-lg mb-3"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-red)' }}
          >
            Erreurs de validation ({errors.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className="p-3 rounded border text-sm"
                style={{
                  backgroundColor: '#FEE2E2',
                  borderColor: 'var(--color-baie-red)',
                  color: 'var(--color-baie-red)',
                }}
              >
                {error.row && <strong>Ligne {error.row}: </strong>}
                {error.message}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Drag & Drop Zone */}
      {!file && (
        <Card>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-6xl">📄</div>
              <div>
                <p className="text-lg font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                  Glissez-déposez votre fichier CSV ici
                </p>
                <p className="text-gray-600 mt-1">ou</p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button as="span" variant="primary">
                    Sélectionner un fichier
                  </Button>
                </label>
              </div>
              <p className="text-sm text-gray-500">Taille maximale: 5 MB</p>
            </div>
          </div>
        </Card>
      )}

      {/* File Preview */}
      {preview && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-lg"
                style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
              >
                Prévisualisation
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {file?.name} - {preview.totalRows} événement(s) à importer
              </p>
            </div>
            <Button variant="secondary" onClick={handleReset} size="sm">
              Annuler
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg" style={{ borderColor: 'var(--color-baie-beige)' }}>
              <thead style={{ backgroundColor: 'var(--color-baie-navy)' }}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-white">Ligne</th>
                  {preview.header.map((col, index) => (
                    <th key={index} className="px-4 py-2 text-left text-xs font-bold text-white">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-baie-beige)' }}>
                {preview.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600">{row.rowNumber}</td>
                    {preview.header.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 text-sm" style={{ color: 'var(--color-baie-navy)' }}>
                        {row.data[col] || <span className="text-gray-400">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.totalRows > 10 && (
            <p className="text-sm text-gray-600 mt-3">
              Affichage des 10 premières lignes sur {preview.totalRows} au total
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Import en cours...' : `Importer ${preview.totalRows} événement(s)`}
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card>
          <h3
            className="text-lg mb-3"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-green)' }}
          >
            Résultat de l'import
          </h3>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>{importResult.imported}</strong> événement(s) importé(s) avec succès
            </p>
            {importResult.events && importResult.events.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Événements importés :</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {importResult.events.map((event, index) => (
                    <li key={index}>
                      {event.nom} - {new Date(event.date).toLocaleDateString('fr-FR')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminImport;
