'use client';

export default function SampleCsvDownload() {
  const handleDownload = () => {
    const sampleCSV = `Registration ID,Ticket Number,Name,Phone,Email,Registration Date
REG001,TKT-12345,王小明,+886912345678,wang@example.com,2024-01-15
REG002,TKT-12346,李小華,+886912345679,lee@example.com,2024-01-16`;

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-participants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="text-blue-600 hover:text-blue-800 text-sm underline"
    >
      下載範例 CSV
    </button>
  );
}
