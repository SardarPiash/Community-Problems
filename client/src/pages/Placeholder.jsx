export default function Placeholder({ title, stage }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">
        {stage ? `This page will be implemented in ${stage}.` : 'Nothing to see here.'}
      </p>
    </div>
  );
}
